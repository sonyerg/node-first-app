const crypto = require("crypto");

const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");

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
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash("error", errors.array()[0].msg);
    return res.status(422).redirect("/login");
  }

  // User is already validated and stored in req.temporaryUser
  req.session.isLoggedIn = true;
  req.session.user = req.temporaryUser;
  req.session.save((err) => {
    if (err) console.error(err);
    res.redirect("/");
  });
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
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());

    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: errors.array()[0].msg,
      oldInput: { email, password },
    });
  }

  User.findOne({ email: email })
    .then((userDoc) => {
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
                req.session.signupSuccess = true;
                res.redirect("/success");
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
    oldInput: { email: "", password: "" },
  });
};

exports.getResetPass = (req, res, next) => {
  let message = req.flash("error");

  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/reset-pass", {
    path: "/reset-pass",
    pageTitle: "Reset Password",
    errorMessage: message,
  });
};

exports.postResetPass = (req, res, next) => {
  const email = req.body.email;

  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log("Error:", err.message);

      return res.redirect("/reset-pass");
    }

    const token = buffer.toString("hex");
    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          req.flash("error", `No account with email: ${email}`);
          return res.redirect("/reset-pass");
        }

        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;

        return user.save();
      })
      .then((result) => {
        res.redirect("/");
        return transporter.sendMail(
          {
            to: req.body.email,
            from: "info@demomailtrap.com",
            subject: "Password Reset",
            html: `
              <p>You requested a password reset.</p>
              <p>Click this <a href="http://localhost:3000/reset-pass/${token}">link</a> to set a new password</p>
            `,
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
        console.error("Error reseting password", err);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;

  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid or expired password reset token.");
        return res.redirect("/reset-pass");
      }

      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }

      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "Update Password",
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      console.error(err);
      req.flash("error", "An error occurred. Please try again.");
      res.redirect("/reset-pass");
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  const confirmPassword = req.body.confirmPassword;
  let resetUser;

  if (newPassword !== confirmPassword) {
    req.flash("error", "Passwords does not match.");
    return res.redirect(`/reset-pass/${passwordToken}`);
  }

  User.findOne({
    _id: userId,
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = null;
      resetUser.resetTokenExpiration = undefined;

      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => {
      console.error(err);
    });
};

exports.getSuccess = (req, res, next) => {
  res.render("auth/success", {
    path: "/success",
    pageTitle: "Sign Up Successful!",
  });
};
