'use strict';
const mongoose = require('mongoose');
require('dotenv').config();


module.exports = function (app) {

  const replySchema = new mongoose.Schema({
    text: String,
    created_on: {type: Date, default: new Date()},
    delete_password: String,
    reported: {type: Boolean, default: false}
  })

  const threadSchema = new mongoose.Schema({
    text: String,
    created_on: {type: Date, default: new Date()},
    bumped_on: {type: Date, default: new Date()},
    reported: {type: Boolean, default: false},
    delete_password: String,
    replies: {type: [replySchema], default: []}
  })

  const boardSchema = new mongoose.Schema({
    name: String,
    threads: {type: [threadSchema], default: []}
  })

  const BoardDB = mongoose.model('BoardDB', boardSchema);

  mongoose.connect(process.env.MONGO_URI);
  
  app.route('/api/threads/:board')
    .get(async function (req, res) {
      const boardName = req.params.board.toLowerCase();
      const boardData = await BoardDB.findOne({name: boardName});
      const returnArray = [];
      if (boardData !== null) {
        const threads = boardData.threads.sort((a, b) => b.bumped_on - a.bumped_on)
        const latest_threads = threads.slice(0, 10)
        latest_threads.forEach((thread => {
          const returnThread = {
            text: thread.text,
            created_on: thread.created_on,
            bumped_on: thread.bumped_on,
            _id: thread._id.toString(),
            replies: []
          };
          const replies = thread.replies.sort((a, b) => b.created_on - a.created_on);
          const latest_replies = replies.slice(0, 3);
          latest_replies.forEach(reply => {
            returnThread.replies.push({text: reply.text, created_on: reply.created_on, _id: reply._id.toString()})
          })
          returnArray.push(returnThread);
        }))
      }
      res.send(returnArray);
    })
    .post(async function (req, res) {
      let boardData = await BoardDB.findOne({name: req.params.board.toLowerCase()});
      if (boardData === null) {
        boardData = await new BoardDB({name: req.params.board.toLowerCase()}).save();
      }
      boardData.threads.push({text: req.body.text, delete_password: req.body.delete_password});
      const savedBoardData = await boardData.save();
      res.json(savedBoardData.threads.at(-1));
    })
    .put(async function(req, res) {
      let returnString;
      let boardData = await BoardDB.findOne({name: req.params.board.toLowerCase()});
      if (boardData === null) {
        returnString = 'No such board';
      } else {
        let foundThread = false;
        for (let i = 0; i < boardData.threads.length; i++) {
          if (boardData.threads[i]._id.toString() === req.body.thread_id){
            boardData.threads[i].reported = true;
            boardData.save();
            returnString = 'reported'
            foundThread = true;
            break;
          }
        }
        if (!foundThread) {
          returnString = 'No such thread on this board'
        }
      }
      res.send(returnString);
    })
    .delete(async function (req, res) {
      let returnString = '';

      res.send(returnString);
    });
    
  app.route('/api/replies/:board')
  .get(async function (req, res){
    let boardData = await BoardDB.findOne({name: req.params.board.toLowerCase()});
    let returnObject;
    if (boardData !== null) {
      console.log(req.params);
      console.log(req.query);
      for (let i = 0; i < boardData.threads.length; i++) {
        if (boardData.threads[i]._id.toString() === req.query.thread_id) {
          const thread = boardData.threads[i];
          returnObject = {
            text: thread.text,
            created_on: thread.created_on,
            bumped_on: thread.bumped_on,
            _id: thread._id.toString(),
            replies: []
          };
          thread.replies.forEach(reply => {
            returnObject.replies.push({text: reply.text, created_on: reply.created_on, _id: reply._id.toString()})
          })
        }
      }
    } else {
      returnObject = {}
    }
    res.json(returnObject);
  })
  .post(async function (req, res) {
    let returnObject;
    let boardData = await BoardDB.findOne({name: req.params.board.toLowerCase()});
    if (boardData !== null) {
      for (let i = 0; i < boardData.threads.length; i++) {
        if (boardData.threads[i]._id.toString() === req.body.thread_id) {
          const currentTime = new Date();
          boardData.threads[i].replies.push({text: req.body.text, delete_password: req.body.delete_password, created_on: currentTime});
          boardData.threads[i].bumped_on = currentTime;
          const newBoard = await boardData.save();
          returnObject = newBoard.threads[i].replies.at(-1);
          break;
        }
      }
    } else {
      returnObject = {};
    }
    res.json(returnObject);
  })
  .put()
  .delete();

};


