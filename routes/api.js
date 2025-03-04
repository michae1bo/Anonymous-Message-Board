'use strict';
const mongoose = require('mongoose');
require('dotenv').config();


module.exports = function (app) {

  const replySchema = new mongoose.Schema({
    text: String,
    created_on: {type: String, default: new Date().toLocaleString()},
    delete_password: String,
    reported: {type: Boolean, default: false}
  })

  const threadSchema = new mongoose.Schema({
    text: String,
    created_on: {type: String, default: new Date().toLocaleString()},
    bumped_on: {type: String, default: new Date().toLocaleString()},
    reported: {type: Boolean, default: false},
    delete_password: String,
    replies: [replySchema]
  })

  const boardSchema = new mongoose.Schema({
    name: String,
    threads: [threadSchema]
  })

  const BoardDB = mongoose.model('BoardDB', boardSchema);

  mongoose.connect(process.env.MONGO_URI);
  
  app.route('/api/threads/:board');
    
  app.route('/api/replies/:board');

};


