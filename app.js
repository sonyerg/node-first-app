const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

//Express js is all about middleware.
const app = express();

const errorController = require("./controllers/error");
const User = require("./models/user");

// app.set("view engine", "pug");
app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth")

app.use(bodyParser.urlencoded({ extended: false }));
//redirect request for files to public folder
app.use(express.static(path.join(__dirname, "public")));

//If the user is found, it creates a new instance of the User class and attaches it to the req object
app.use((req, res, next) => {
  User.findById("670e0e936512292ad6b7789a")
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(process.env.MONGODB_URI)
  .then((result) => {
    User.findOne().then((user) => {
      if (!user) {
        const user = new User({
          name: "Erickson",
          email: "erg@test.com",
          cart: {
            items: [],
          },
        });
        user.save();
      }
    });
    app.listen(3000);
    console.log("Running on: http://localhost:3000");
  })
  .catch((err) => {
    console.log(err);
  });
