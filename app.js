var express           = require("express"),
    app               = express(),
    methodOverride    = require("method-override"),
    expressSanitizer  = require("express-sanitizer"),
    bodyParser        = require("body-parser"),
    mongoose          = require("mongoose"),
    flash             = require("connect-flash"),
    passport          = require("passport"),
    LocalStrategy     =require("passport-local"),
    session             =require("express-session"),
    Blog = require("./models/blog"),
    User = require("./models/user"),
    Comment = require("./models/comment");
//requiring routes
var blogsRoutes = require("./routes/blogs"),
    authRoutes  = require("./routes/index"),
    commentRoutes = require("./routes/comments");



// APP CONFIG
var uri = process.env.DATABASEURI || "mongodb://localhost/rest_blog_app"
// mongoose.connect("mongodb://localhost/rest_blog_app");
mongoose.connect(uri,{
	useNewUrlParser:true,
	useCreateINdex:true
}).then(()=>{
	console.log("connected to DB");
}).catch(err => {
	console.log("ERROR:",err.message);
});

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(expressSanitizer());
app.use(flash());
//authetication use
app.use(session({
    secret : "I hate bugs",
    resave : false,
    saveUninitialized : false
}));

//pasport config
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use(authRoutes);
app.use(blogsRoutes);
app.use("/blogs/:id/comments", commentRoutes);
// app.use(commentsRoutes);
// LISTENER PROCESS
var port = process.env.PORT || 31000
app.listen(port, process.env.IP,function(){
    console.log("Server started at port:"+ port);
})