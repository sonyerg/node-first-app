const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { MailtrapClient } = require("mailtrap");

const User = require("../models/user");

const transporter = nodemailer.createTransport({
  host: "live.smtp.mailtrap.io",
  port: 587,
  auth: {
    user: "api",
    pass: "a18922ae199b7f3f731f918365cfc632",
  },
});

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");

  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid email or password.");
        return res.redirect("/login");
      }

      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            console.log(`Successfully logged in! ID: ${user._id}`);

            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              console.error(err);
              res.redirect("/");
            });
          }
          req.flash("error", "Invalid email or password.");
          res.redirect("/login");
        })
        .catch((err) => {
          console.error(err);
          return res.redirect("login");
        });
    })
    .catch((err) => console.error(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.error(err);
    res.redirect("/");
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  if (password !== confirmPassword) {
    req.flash("error", "Passwords does not match.");
    return res.redirect("/signup");
  }

  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        req.flash("error", "User exist already.");
        return res.redirect("/signup");
      }

      return bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          const user = User({
            email: email,
            password: hashedPassword,
            cart: { items: [] },
          });

          return user.save();
        })
        .then((result) => {
          return transporter.sendMail(
            {
              from: "info@demomailtrap.com",
              to: email,
              subject: "Sign up with NodeShop is successful!",
              text: "You can now login in NodeShop with your credentials.",
            },
            (error, info) => {
              if (error) {
                console.error("Error sending email", error);
                req.flash("error", "Error creating your account.");
              } else {
                console.log("Email sent:", info.response);
                res.redirect("/login");
              }
            }
          );
        })
        .catch((err) => {
          req.flash("error", "Error creating your account.");
          res.redirect("/signup");
          console.log(err);
        });
    })
    .catch((err) => {
      req.flash("error", "There was an error signing up");
      res.redirect("/signup");
      console.error(err);
    });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");

  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,
  });
};
