const express = require("express");

const app = express();

//Express js is all about middleware.

app.use("/", (req, res, next) => {
  console.log("This is middleware");
  next(); //allows request to continue to the next middleware in line
});

app.use("/users", (req, res, next) => {
  res.send("<h1>Users page</h1>");
});

app.use("/", (req, res, next) => {
  res.send("<h1>Hello from express</h1>");
});

app.listen(3000);
