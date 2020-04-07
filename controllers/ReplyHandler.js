const ObjectId = require('mongodb').ObjectId;

function ReplyHandler (){
  this.getReply = function(req, res) {
    const db   = req.app.locals.db; 
    let board  = req.params.board;
    let threadId = req.query.thread_id;
    
    db.collection(board).find({_id: ObjectId(threadId)})
      .toArray((err, data) => {
           res.json(data[0]);
      })

  }
  
  this.newReply = function(req, res){
    const db   = req.app.locals.db; 
    let board  = req.params.board;
    let threadId = req.body.thread_id;
    
    let replies = {
      _id: new ObjectId(),
      text: req.body.text,
      created_on:  new Date(),
      delete_password: req.body.delete_password,
      reported: false,
    };

    db.collection(board).findOneAndUpdate(
      {_id: ObjectId(threadId)},
      { $push: {replies}, $set: {bumped_on: new Date()}},
      (err, data) => {
      res.redirect('/b/'+board+'/');
    });
    
  }
  
  this.reportReply = function(req, res){
   const db       = req.app.locals.db;
    let board      = req.params.board;
    let threadId   = req.body.thread_id;
    let replyId    = req.body.reply_id;

    db.collection(board).findOneAndUpdate(
      {
        _id: ObjectId(threadId),
        'replies._id': ObjectId(replyId)
      },
        {$set: {'replies.$.reported': true}},
        (err, doc) => {
          (err) ? res.send('report unsuccessful') : res.send('success');
        }
    );
    
    
  }
  this.deleteReply = function(req, res){
   const db       = req.app.locals.db;
   let board      = req.params.board;
   let threadId   = req.body.thread_id;
   let replyId    = req.body.reply_id;
   let pwd        = req.body.delete_password;
    
    db.collection(board).findOneAndUpdate(
    { _id: ObjectId(threadId), replies: { $elemMatch: {_id: ObjectId(replyId), delete_password: pwd}}},
    { $set: { 'replies.$.text': '[deleted]'}},
    { returnNewDocument: true}
    )
    .then( (data) => {
      (data.value === null) ? res.send('incorrect password') : res.send('success');
    })
    .catch(err => console.log(err))
  
    console.log("req=" + req);
  }
  
  
}

module.exports = ReplyHandler;