var mongoose = require("mongoose");
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
// JUST A TEST DATA PASSED TO DATABASE

// Blog.create({
//     title: "Test Blog",
//     image: "https://cdn.pixabay.com/photo/2016/12/13/05/15/puppy-1903313__340.jpg",
//     body :"This is just one time thing"
// });

//user models
module.exports = mongoose.model("Blog",blogSchema);
