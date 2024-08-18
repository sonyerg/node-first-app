const express = require("express");
const bodyParser = require("body-parser");

//Express js is all about middleware.
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use("/add-product", (req, res, next) => {
  res.send(
    `<form action='/product' method='POST'>
      <input type='text' name='title' />
      <button type='submit'>Send</button>
    </form>`
  );
});

app.post("/product", (req, res, next) => {
  console.log(req.body);
  res.redirect("/");
});

app.use("/", (req, res, next) => {
  res.send("<h1>Hello from express</h1>");
});

app.listen(3000);
