var express = require('express');
var app = express();
var bodyParser = require('body-parser'); 
app.use(bodyParser.urlencoded({ extended: true }));
var path = require('path');
app.use(express.static(path.join(__dirname, './static')));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/basic_mongoose');


var Schema = mongoose.Schema;
// define Post Schema
var PostSchema = new mongoose.Schema({
 name: {type: String, required: true, minlength: 2},
 text: {type: String, required: true, minlength: 2, maxlength: 140 }, 
 comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
}, {timestamps: true });
// define Comment Schema
var CommentSchema = new mongoose.Schema({
 _post: {type: Schema.Types.ObjectId, ref: 'Post'},
 text: {type: String, required: true, minlength: 2 }, 
 name: {type: String, required: true, minlength: 2} 
}, {timestamps: true });
// set our models by passing them their respective Schemas
mongoose.model('Post', PostSchema);
mongoose.model('Comment', CommentSchema);
// store our models in variables
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');
// route for getting a particular post and comments
app.get('/posts/:id', function (req, res){
 Post.findOne({_id: req.params.id})
 .populate('comments')
 .exec(function(err, post) {
      res.render('post', {post: post});
        });
});
// route for creating one comment with the parent post id
app.post('/message', function(req, res) {
    console.log("POST DATA", req.body);
      // This is where we would add the user from req.body to the database.
    var post = new Post({name: req.body.name, text: req.body.text});
    post.save(function(err) {
      if(err) {
        console.log('something went wrong');
        // Post.find({})
        // .populate('comments')
        //   .exec(function(err, data) {
        //     res.render('index', {message: data, title: 'you have errors!', errors: post.errors });
        //   });
        res.redirect('/')
      } else { // else console.log that we did well and then redirect to the root route
        console.log('successfully added a post!');
        res.redirect('/');
      }
    })
    
})

//this is for adding comments :D
app.post('/posts/:id', function (req, res){
  Post.findOne({_id: req.params.id}, function(err, post){
         var comment = new Comment({text: req.body.text, name: req.body.name} );
         console.log(comment.name, comment.text)
         comment._post = post._id;
         post.comments.push(comment);
         comment.save(function(err){
                 post.save(function(err){
                       if(err) { console.log('Error'); } 
                       else { console.log("it worked")
                         res.redirect('/'); }
                 });
         });
   });
 });



app.get('/', function(req, res) {
  Post.find({})
  .populate('comments')
 .exec(function(err, data) {
      res.render('index', {message: data});
        });
})


// just an example route, your routes may look different
app.get('/posts/:id', function (req, res){
// the populate method is what grabs all of the comments using their IDs stored in the 
// comment property array of the post document!
 Post.findOne({_id: req.params.id})
 .populate('comments')
 .exec(function(err, post) {
      res.render('index', {post: post});
        });
});
























app.listen(8000, function() {
    console.log("listening on port 8000");

})