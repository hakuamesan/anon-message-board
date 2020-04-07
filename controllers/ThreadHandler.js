const ObjectId = require('mongodb').ObjectId;

function ThreadHandler (){
  this.getThread = function(req, res) {
    const db   = req.app.locals.db; 
    let board  = req.params.board;
    
    db.collection(board).find({})
      .project({
          reported: 0,
          delete_password: 0,
          "replies.delete_password": 0,
          "replies.reported": 0
      })
      .sort({bumped_on:-1})
      .limit(10)
      .toArray((err, data) => {
        data.forEach(function(data){
          data.replycount = data.replies.length;
          
          if (data.replycount > 3){
            data.replies = data.replies.splice(0,3);
          }
        })
      
      res.json(data);
      })

      
  }
  
  this.newThread = function(req, res){
    const db   = req.app.locals.db; 
    let board  = req.params.board;
    
    let thread = {
      text: req.body.text,
      created_on:  new Date(),
      bumped_on:   new Date(),
      reported: false,
      delete_password: req.body.delete_password,
      replies: []
    };
    db.collection(board).insertOne(thread, (err, data) => {
      res.redirect('/b/'+board+'/');
    });

    
  }
  
  this.reportThread = function(req, res){
    const db   = req.app.locals.db; 
    let board  = req.params.board;
    let threadId = req.body.thread_id;
    
    db.collection(board).findOneAndUpdate(
      {_id: ObjectId(threadId)},
      {$set: {reported: true}},
      (err, data) => {
        (err) ? res.send('Report failed!') : res.send('success');
      }
    );
     
  }
  
  
  
  this.deleteThread = async function(req, res){
    const db   = req.app.locals.db; 
    let board  = req.params.board;
    let threadId = req.body.thread_id;
    let pwd = req.body.delete_password;
    
    console.log("thread:" + threadId)
    console.log("pwd:" + pwd)
    
    
  
    let r = await db.collection(board)
                .deleteOne({_id: ObjectId(threadId), delete_password: pwd})
                .then( (data) => {
                  ( data.deletedCount > 0) ? res.send('success') : res.send('incorrect password');
                  console.log(req);
                  window.location.reload();
                })
                .catch( (e) => {
                  console.log(e);
                })
      
      
    }
  
  
}

module.exports = ThreadHandler;