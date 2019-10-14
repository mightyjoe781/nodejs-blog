var express =require("express");
var router =express.Router({mergeParams: true});
var Blog = require("../models/blog");


//INDEX ROUTE
router.get("/blogs",function(req ,res){
    Blog.find({},function(err,blogs){
        if(err){
            console.log("ERROR!");
        } else {
            res.render("index",{blogs : blogs});
        }
    })
});
//NEW ROUTE
router.get("/blogs/new",isLoggedIn,function(req,res){
    res.render("new");
});
//Create ROUTE

router.post("/blogs",isLoggedIn,function(req,res){
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
            res.render("new");
        } else {
             //then redirect to the index
             res.redirect("/blogs");
        }
    });
});
// SHOW ROUTE
router.get("/blogs/:id",function(req,res){
    Blog.findById(req.params.id,function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("show",{blog: foundBlog})
        }
    });
});

//EDIT ROUTE
router.get("/blogs/:id/edit",checkBlogOwner,function(req,res){
    Blog.findById(req.params.id,function(err,foundBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("edit",{blog:foundBlog});
        }
    });
});
//UPDATE ROUTE
router.put("/blogs/:id",checkBlogOwner,function(req,res){
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
router.delete("/blogs/:id",checkBlogOwner,function(req,res){
    
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
//middleware to check login
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}
//middleware to check user ownership
function checkBlogOwner(req,res,next){
    if(req.isAuthenticated()){
        Blog.findById(req.params.id,function(err,foundBlog){
            if(err){
                res.redirect("back");
            } else {
                if(foundBlog.author.id.equals(req.user._id)){
                    next()
                } else {
                    res.redirect("back");
                }
            }
        })
    } else {
        res.redirect("back");
    }
}

module.exports = router;