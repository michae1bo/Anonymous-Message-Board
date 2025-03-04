const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  let threadId;
  let replyId;
  const replyTesterId = '67c77a94870940453f67ff58'

  test('Creating a new thread: POST request to /api/threads/my_test', function(done) {
    chai.request(server)
      .post('/api/threads/my_test')
      .type('form')
      .send({
        text: 'this is my 2nd test text',
        delete_password: 'delete!'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        done();
      })
  })
  test('10 threads 3 replies each: GET request to /api/threads/my_test', function(done) {
    chai.request(server)
      .get('/api/threads/my_test')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isAtMost(res.body.length, 10)
        assert.isAtMost(res.body[0].replies.length, 3)
        threadId = res.body[0]._id;
        done();
      })
  })

  test('Reporting a thread: PUT request to /api/threads/my_test', function(done){

    chai.request(server)
      .put('/api/threads/my_test')
      .send({
        thread_id: threadId
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'reported')
        done();
      })
  })
  test('DELETE request to /api/threads/my_test with invalid delete_password', function(done) {
    chai.request(server)
      .delete('/api/threads/my_test')
      .type('form')
      .send({
        thread_id: threadId,
        delete_password: 'wrong'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isString(res.text);
        assert.equal(res.text, 'incorrect password')
        done();
      })
  })

  test('DELETE request to /api/threads/my_test with invalid delete_password', function(done) {
    chai.request(server)
      .delete('/api/threads/my_test')
      .type('form')
      .send({
        thread_id: threadId,
        delete_password: 'delete!'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isString(res.text);
        assert.equal(res.text, 'success')
        done();
      })
  })

  test('new reply: POST request to /api/replies/my_test', function(done) {
    chai.request(server)
      .post('/api/replies/my_test')
      .type('form')
      .send({
        text: 'test in replies', 
        delete_password: 'delete!!',
        thread_id: replyTesterId
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        done();
      })
  })

  test('Viewing a single thread with all replies: GET request to /api/replies/my_test', function(done) {
    chai.request(server)
      .get(`/api/replies/my_test?thread_id=${replyTesterId}`)
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'text');
        assert.property(res.body, 'created_on');
        assert.property(res.body, 'bumped_on')
        assert.isArray(res.body.replies);
        replyId = res.body.replies.at(-1)._id
        done();
      })
  })

  test('Reporting a reply: PUT request to /api/replies/my_test', function(done) {
    chai.request(server)
      .put('/api/replies/my_test')
      .type('form')
      .send({
        reply_id: replyId,
        thread_id: replyTesterId,
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'reported')
        done();
      })
  })

  test('DELETE request to /api/replies/my_test with an invalid delete_password', function(done) {
    chai.request(server)
      .delete('/api/replies/my_test')
      .type('form')
      .send({
        thread_id: '67c77a94870940453f67ff58',
        reply_id: replyId,
        delete_password: 'wrong'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'incorrect password');
        done();
      })
  })

  test('DELETE request to /api/replies/my_test with an invalid delete_password', function(done) {
    chai.request(server)
      .delete('/api/replies/my_test')
      .type('form')
      .send({
        thread_id: '67c77a94870940453f67ff58',
        reply_id: replyId,
        delete_password: 'delete!!'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.text, 'success');
        done();
      })
  })

});
