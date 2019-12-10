var express = require('express'),
    methodOverride = require('method-override'),
    expressSanitizer = require('express-sanitizer')
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    app = express();

//Database connection established
mongoose.connect("mongodb+srv://Mthreeuser:Mthree123@cluster0-vuvjc.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true })
mongoose.set('useFindAndModify', false);
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

//Database Schema establised
var BlogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", BlogSchema)

app.get("/", function(req, res){
    res.redirect("/blogs")
})

app.get("/blogs",function(req, res){
    Blog.find({}, function(err, blogsData){
        if(err){
            console.log("Error")
        }else{
            res.render("index", {blogs:blogsData})
        }
    })
})

//New Route
app.get("/blogs/new", function(req, res){
    res.render("new");
})

//Create Route
app.post("/blogs", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body)
    Blog.create(req.body.blog, function(err,blogData){
        if(err){
            res.render("/blogs/new");
        }else{
            res.redirect("/blogs");
        }
    })
})

//Show route
app.get("/blogs/:id", function(req, res){
    Blog.findById(req.params.id, function(err, foundID){
        if(err){
            res.redirect("/blogs")
        }else{
            res.render("show", {blog: foundID})
        }
    })
})

//Edit route
app.get("/blogs/:id/edit", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.render("/blogs")
        }else{
            res.render("edit", {blog:foundBlog});
        }
    })
})

//Update route
app.put("/blogs/:id", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body)
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, update){
        if(err){
            res.redirect("/blogs")
        }else{
            res.redirect("/blogs/"+req.params.id)
        }
    })
})

//Delete route
app.delete("/blogs/:id", function(req, res){
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blogs")
        }else{
            res.redirect("/blogs")
        }
    })
})

app.listen("3000", function(){
    console.log("server has started!")
})