if (process.env.NODE_ENV != "production"){
    require("dotenv").config();
}




const express= require("express");
const app = express();
const mongoose = require("mongoose");
const Listing  = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./util/wrapAsync.js");
const ExpressError = require("./util/ExpressError.js");
const {listeningSchema, reviewSchema} = require("./schema.js");
const Review  = require("./models/review.js");


const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const { connected } = require("process");
const passport = require("passport");
const localstrategy = require("passport-local");
const User = require("./models/user.js");
const bookingRoutes = require("./routes/bookingroute.js")



const listingsrouter = require("./routes/listing.js");
const reviewsrouter = require("./routes/review.js");
const userrouter = require("./routes/user.js");
const { rmSync } = require("fs");


const dbUrl = process.env.ATLASDB_URL;

main().then(()=>{
    console.log("Conneted to db");

})
.catch(err => {
    console.log(err);
})
async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname , "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname ,"/public")));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto:{
        secret:process.env.SECRET
    },
    touchAfter: 24*3600,
});

store.on("error", () =>{
    console.log("Error in MONGO SESSION STORE");
})




const sessionoption = {
    store,
    secret:process.env.SECRET,
    resave: false,
    saveUninitialized : true,
    cookie :{
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly : true,
        }
};


app.use(session(sessionoption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localstrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




app.use((req ,res ,next) =>{
    res.locals.success =  req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})


app.use("/listings" , listingsrouter);
app.use("/listings/:id/reviews" , reviewsrouter);
app.use("/", userrouter);



     app.all("*" ,(req ,res, next) =>{
      next(new ExpressError(404 ,"Page not found!"));
     });

app.use((err , req , res ,next) =>{
  let {StatusCode = 500, message = "Something went wrong!"} = err;
  res.status(StatusCode).render("error.ejs" , {message});
 // res.status(StatusCode).send(message);
});

app.listen(8080 ,()=>{
  console.log("Sever is listening to port 8080");
});
