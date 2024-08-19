const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const expressHbs = require("express-handlebars");
//Express js is all about middleware.
const app = express();

const errorController = require("./controllers/error");

app.set("view engine", "pug");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
//redirect request for files to public folder
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

app.listen(3000);
