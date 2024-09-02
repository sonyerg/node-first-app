const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
//Express js is all about middleware.
const app = express();

const errorController = require("./controllers/error");
const mongoConnect = require("./utils/database").mongoConnect;

// app.set("view engine", "pug");
app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
//redirect request for files to public folder
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  // User.findByPk(1)
  //   .then((user) => {
  //     req.user = user;
  //     next();
  //   })
  //   .catch((err) => console.log(err));
  next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoConnect(() => {
  app.listen(3000, () => {
      console.log("Node Running on http://localhost:3000");
    });
});
