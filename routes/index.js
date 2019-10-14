var express =require("express");
var router =express.Router();
var passport = require("passport");
var User = require("../models/user");

// RESTFUL ROUTES

router.get("/",function(req,res){
    res.redirect("/blogs");
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
    User.register(new User({username:req.body.username}),req.body.password,function(err,user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate('local')(req,res,function(){
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
    res.redirect("/");
})

module.exports = router;