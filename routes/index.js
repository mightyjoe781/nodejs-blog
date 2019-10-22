var express =require("express");
var router =express.Router();
var passport = require("passport");
var User = require("../models/user");

// RESTFUL ROUTES

router.get("/",function(req,res){
    res.render("landing.ejs");
});

//=====================
//AUTHENTICATION ROUTEs
//=====================

//showing registration page
router.get("/register",function(req,res){
    res.render("register");
})

//registration logic
router.post("/register",function(req,res){
    var newUser = new User({username:req.body.username});
    User.register(newUser,req.body.password,function(err,user){
        if(err){
            req.flash("error",err.message);
            return res.redirect("register");
        }
        passport.authenticate('local')(req,res,function(){
            req.flash("sucess","Welcome "+ req.body.username +" to the Dr_Who's Exclusive Blog");
            res.redirect("/blogs");
        })
    })
})

//login forms
router.get("/login",function(req,res){
	res.render("login");
})
//handling login logic
router.post("/login",passport.authenticate('local',{
    successRedirect: '/blogs',
    failureRedirect: '/login'
}),function(req,res){});
//logout routes

router.get('/logout',function(req,res){
    req.logout();
    req.flash("success","Logged you out!")
    res.redirect("/blogs");
})

module.exports = router;