const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
//Express js is all about middleware.
const app = express();

const errorController = require("./controllers/error");
const sequelize = require("./utils/datbase");

// app.set("view engine", "pug");
app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
//redirect request for files to public folder
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

//syncs your model to the database by creating the appropriate tables and relations
sequelize
  .sync()
  .then((result) => {
    // console.log(result);
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
