var express           = require("express"),
    methodOverride    = require("method-override"),
    expressSanitizer  = require("express-sanitizer"),
    bodyParser        = require("body-parser"),
    mongoose          = require("mongoose"),
    flash             = require("connect-flash"),
    app               = express(),
    passport          = require("passport"),
    LocalStrategy     =require("passport-local"),
    session             =require("express-session"),
    Blog = require("./models/blog"),
    User = require("./models/user");
//requiring routes
var blogsRoutes = require("./routes/blogs"),
    authRoutes  = require("./routes/index");



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


app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}))
app.use(methodOverride("_method"));
app.use(expressSanitizer());
app.use(flash());
//authetication use
app.use(session({
    secret : "I hate bugs",
    resave : false,
    saveUninitialized : false
}));
app.use(passport.initialize());
app.use(passport.session());

//pass all pages current Username
// app.use(function(req, res, next) {
// res.locals.currentUsername = req.user;
// next();
// });

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
res.locals.currentUser = req.user;
next();
});
app.use(authRoutes);
app.use(blogsRoutes);
// LISTENER PROCESS
var port = process.env.PORT || 31000
app.listen(port, process.env.IP,function(){
    console.log("Server started at port:"+ port);
})