const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");

require("dotenv").config();

//Express js is all about middleware.
const app = express();
const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: "sessions",
});
const csrfProtection = csrf();

const errorController = require("./controllers/error");
const User = require("./models/user");

// app.set("view engine", "pug");
app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
//redirect request for files to public folder
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "secret999",
    resave: false,
    saveUninitialized: false,
    store,
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {

  if (!req.session.user) {
    return next();
  }

  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }

      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err)); //when inside async, use next()
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get("/500", errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  res.status(500).render("500", {
    pageTitle: "500 Internal Server Error",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then((result) => {
    app.listen(3000);
    console.log("Running on: http://localhost:3000");
  })
  .catch((err) => {
    console.log(err);
  });
