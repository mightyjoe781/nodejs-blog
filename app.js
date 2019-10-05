var express = require("express"),
methodOverride=require("method-override"),
expressSanitizer = require("express-sanitizer"),
bodyParser  = require("body-parser"),
mongoose    =require("mongoose"),
app         = express();

// APP CONFIG

mongoose.connect("mongodb://localhost/rest_blog_app");
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}))
app.use(methodOverride("_method"));
app.use(expressSanitizer());
//MONGOOSE MODEL CONFIG

var blogSchema = new mongoose.Schema({
    title : String,
    image : String,
    body: String,
    created : {type: Date, default : Date.now}
});

var Blog = mongoose.model("Blog",blogSchema);

// JUST A TEST DATA PASSED TO DATABASE

// Blog.create({
//     title: "Test Blog",
//     image: "https://cdn.pixabay.com/photo/2016/12/13/05/15/puppy-1903313__340.jpg",
//     body :"This is just one time thing"
// });

// RESTFUL ROUTES

app.get("/",function(req,res){
    res.redirect("/blogs");
});

//INDEX ROUTE

app.get("/blogs",function(req ,res){
    Blog.find({},function(err,blogs){
        if(err){
            console.log("ERROR!");
        } else {
            res.render("index",{blogs : blogs});
        }
    })
});
//NEW ROUTE
app.get("/blogs/new",function(req,res){
    res.render("new");
});
//Create ROUTE

app.post("/blogs",function(req,res){
    //create blog
    req.body.blog.body = req.sanitize(req.body.blog.body)
    Blog.create(req.body.blog,function(err,newblog){
        if(err){
            res.render("new");
        } else {
             //then redirect to the index
             res.redirect("/blogs");
        }
    });
});
// SHOW ROUTE
app.get("/blogs/:id",function(req,res){
    Blog.findById(req.params.id,function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("show",{blog: foundBlog})
        }
    });
});

//EDIT ROUTE
app.get("/blogs/:id/edit",function(req,res){
    Blog.findById(req.params.id,function(err,foundBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("edit",{blog:foundBlog});
        }
    });
});
//UPDATE ROUTE
app.put("/blogs/:id",function(req,res){
    req.body.blog.body = req.sanitize(req.body.blog.body)
    Blog.findByIdAndUpdate(req.params.id, req.body.blog,function(err,updateBlog){
        if(err){
            res.redirect("/blogs");
        } else{
            res.redirect("/blogs/"+req.params.id);
        }
    })
})

//DELETE Route
app.delete("/blogs/:id",function(req,res){
    
    //destroy blog
    Blog.findByIdAndRemove(req.params.id,function(err){
        if(err){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    })
    //redirect somewhere
})
// LISTENER PROCESS

app.listen(12345 ,function(){
    console.log("Server started");
})