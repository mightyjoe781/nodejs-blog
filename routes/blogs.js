var express =require("express");
var router =express.Router();
var Blog = require("../models/blog");
var middleware =require("../middleware");


//INDEX ROUTE
router.get("/blogs",function(req ,res){
    Blog.find({},function(err,allblogs){
        if(err){
            console.log(err);
        } else {
            res.render("./blogs/index",{blogs:allblogs});
        }
    })
});
//NEW ROUTE
router.get("/blogs/new",middleware.isLoggedIn,function(req,res){
    res.render("./blogs/new");
});
//Create ROUTE

router.post("/blogs",middleware.isLoggedIn,function(req,res){
    //create blog
    var title = req.body.blog.title;
    var image = req.body.blog.image;
    var body = req.sanitize(req.body.blog.body)
    var author = {
        id : req.user._id,
        username : req.user.username
    }
    var newPost = {
        title :title,
        image : image,
        body:body,
        author:author
    }    
    Blog.create(newPost,function(err,newblog){
        if(err){
            res.render("./blogs/new");
        } else {
             //then redirect to the index
             res.redirect("/blogs");
        }
    });
});
// SHOW ROUTE
router.get("/blogs/:id",function(req,res){
    Blog.findById(req.params.id).populate("comments").exec(function(err, foundBlog){
        if(err){
            console.log(err);
            res.redirect("/blogs");
        } else {
            res.render("./blogs/show",{blog: foundBlog})
        }
    });
});

//EDIT ROUTE
router.get("/blogs/:id/edit",middleware.checkBlogOwner,function(req,res){
    Blog.findById(req.params.id,function(err,foundBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("./blogs/edit",{blog:foundBlog});
        }
    });
});
//UPDATE ROUTE
router.put("/blogs/:id",middleware.checkBlogOwner,function(req,res){
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
router.delete("/blogs/:id",middleware.checkBlogOwner,function(req,res){
    
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
module.exports = router;