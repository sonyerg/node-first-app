const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
//Express js is all about middleware.
const app = express();

const errorController = require("./controllers/error");
const sequelize = require("./utils/datbase");
const Product = require("./models/product");
const User = require("./models/user");

// app.set("view engine", "pug");
app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
//redirect request for files to public folder
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findByPk(1)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product);

//syncs your model to the database by creating the appropriate tables and relations
sequelize
  .sync()
  .then((result) => {
    return User.findByPk(1);
  })
  .then((user) => {
    if (!user) {
      return User.create({ name: "Erickson", email: "erick@test.com" });
    } else {
      return user;
    }
  })
  .then((user) => {
    console.log("Username:", user.name, "User Email:", user.email);
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
