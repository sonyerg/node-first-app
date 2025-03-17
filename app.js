const path = require("path");
const fs = require("fs");
const https = require("https");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

require("dotenv").config();

//Express js is all about middleware.
const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"],
        connectSrc: ["'self'", "https://api.stripe.com"],
        imgSrc: ["'self'", "data:", "https://*.stripe.com"],
      },
    },
  })
);

app.use(compression());

// const accessLogStream = fs.createWriteStream(
//   path.join(__dirname, "access.log"),
//   { flags: "a" }
// );

// app.use(morgan("combined", { stream: accessLogStream }));

const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: "sessions",
});
const csrfProtection = csrf();

// const privateKey = fs.readFileSync("server.key");
// const certificate = fs.readFileSync("server.cert");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    const date = new Date().toISOString().replace(/:/g, "-");

    cb(null, date + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const mimetype = file.mimetype;

  if (
    mimetype === "image/jpg" ||
    mimetype === "image/png" ||
    mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const errorController = require("./controllers/error");
const User = require("./models/user");

// app.set("view engine", "pug");
app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter }).single("image"));
//redirect request for files to public folder
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

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
  console.log(error);

  res.status(500).render("500", {
    pageTitle: "500 Internal Server Error",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
});

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true,
    sslValidate: false,
  })
  .then((result) => {
    // https
    //   .createServer({ key: privateKey, cert: certificate }, app)
    //   .listen(3000);
    app.listen(process.env.PORT || 3000);
    // console.log("Running on: http://localhost:3000");
  })
  .catch((err) => {
    console.log(err);
  });
