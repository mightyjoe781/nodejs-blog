var express           = require("express"),
    methodOverride    = require("method-override"),
    expressSanitizer  = require("express-sanitizer"),
    bodyParser        = require("body-parser"),
    mongoose          = require("mongoose"),
    app               = express(),
    passport          = require("passport"),
    LocalStrategy     =require("passport-local"),
    passportLocalMongoose=require("passport-local-mongoose"),
    session             =require("express-session");
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
//authetication use
app.use(session({
    secret : "I hate bugs",
    resave : false,
    saveUninitialized : false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
res.locals.currentUsername = req.user;
next();
});
//MONGOOSE MODEL CONFIG

var blogSchema = new mongoose.Schema({
    title : String,
    image : String,
    body: String,
    author : {
        id: {
            type : mongoose.Schema.Types.ObjectId,
            ref : "User"
        },
        username : String
    },
    created : {type: Date, default : Date.now}
});

var Blog = mongoose.model("Blog",blogSchema);

// JUST A TEST DATA PASSED TO DATABASE

// Blog.create({
//     title: "Test Blog",
//     image: "https://cdn.pixabay.com/photo/2016/12/13/05/15/puppy-1903313__340.jpg",
//     body :"This is just one time thing"
// });

//user models
var userSchema = new mongoose.Schema({
    username:String,
    password : String
});
userSchema.plugin(passportLocalMongoose);
var User = mongoose.model("User",userSchema);

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
res.locals.currentUser = req.user;
next();
});
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
app.get("/blogs/new",isLoggedIn,function(req,res){
    res.render("new");
});
//Create ROUTE

app.post("/blogs",isLoggedIn,function(req,res){
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
app.get("/blogs/:id/edit",checkBlogOwner,function(req,res){
    Blog.findById(req.params.id,function(err,foundBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("edit",{blog:foundBlog});
        }
    });
});
//UPDATE ROUTE
app.put("/blogs/:id",checkBlogOwner,function(req,res){
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
app.delete("/blogs/:id",checkBlogOwner,function(req,res){
    
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
//=====================
//AUTHENTICATION ROUTEs
//=====================
//login routes
app.get("/login",function(req,res){
	res.render("login");
})

app.post("/login",passport.authenticate('local',{
    successRedirect: '/blogs',
    failureRedirect: '/login'
}),function(req,res){});
//logout routes

app.get('/logout',function(req,res){
    req.logout();
    res.redirect("/");
})

//register routes
app.get("/register",function(req,res){
    res.render("register");
})
app.post("/register",function(req,res){
    User.register(new User({username:req.body.username}),req.body.password,function(err,user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        password.authenticate('local')(req,res,function(){
            res.redirect("/blogs");
        })
    })
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

// LISTENER PROCESS
var port = process.env.PORT || 31000
app.listen(port, process.env.IP,function(){
    console.log("Server started at port:"+ port);
})