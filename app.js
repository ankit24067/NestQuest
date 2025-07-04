if (process.env.NODE_ENV != "production") {
   require('dotenv').config()
   
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const listingRouter = require("./routes/listing");
const reviewRouter = require("./routes/review");
const userRouter = require("./routes/user");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash  = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const { error } = require('console');





const dbURL = process.env.ATLASDB_URL;
async function main() {
   await mongoose.connect(dbURL);
}
main()
   .then(() => {
      console.log("Connected to DB");
   })
   .catch((err) => {
      console.error("DB connection error:", err);
   });

// View engine setup
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ✅ Middleware - Proper Order
app.use(express.urlencoded({ extended: true }));  // Parse form data
app.use(express.json());                          // Optional: parse JSON
app.use(methodOverride("_method"));               // Support PUT/DELETE
app.use(express.static(path.join(__dirname, "/public"))); // Serve static files

const store = MongoStore.create({
   mongoUrl:dbURL,
   crypto:{
      secret:process.env.SECRET,
   },
   touchAfter: 24*3600,
});
store.on("error",()=>{
   console.log("Error in Mongo S ession Stores", err)
})
const sessionOptions = {
   store,
   secret: process.env.SECRET,
   resave: false,
   saveUninitialized :true,
   cookie: {
      expires: Date.now() + 7*24*60*60*1000,
      maxAge : 7 * 24 * 60 * 60 * 1000,
      httpOnly : true,
   }

};
// 🏠 Root route
app.get("/", (req, res) => {
   res.redirect("/listings"); // or render a landing/home page
});



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next)=>{
   res.locals.success = req.flash("success");
   res.locals.error = req.flash("error");
   res.locals.currUser = req.user;
   // console.log(res.locals.success);
   next();
})

// app.get("/demouser", assync(req, res)=>{
//    let fakeUser = new User({
//       email:"student@gmail.com",
//       username: "delta-student"
//    });
//    let registeredUser = await User.register(fakeUser, "helloworld");
//    res.send(registeredUser);
// })

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

// all routes
// ab karke dekho error aa rha rahega

// app.all("*",(req,res,next)=>{
//    next(new ExpressError(404, "Page Not Found!"));
// });

// 🛑 Error handling
app.use((err, req, res, next) => {
   const { statusCode = 500, message = "Something went wrong!" } = err;
   // res.status(statusCode).send(message);
   res.status(statusCode).render("error.ejs",{message});
});

// 🚀 Start the server
app.listen(8080, () => {
   console.log("Server is listening on port 8080");
});
