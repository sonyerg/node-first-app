const express = require("express");
const { check, body } = require("express-validator");
const bcrypt = require("bcryptjs");

const authController = require("../controllers/auth");
const User = require("../models/user");
const signupSuccess = require("../middleware/signup-success");

const router = express.Router();

router.get("/login", authController.getLogin);

router.post(
  "/login",
  [
    check("email")
      .isEmail()
      .custom(async (value, { req }) => {
        const user = await User.findOne({ email: value });
        if (!user) {
          return Promise.reject("Invalid email or password.");
        }
        req.temporaryUser = user;
        return true;
      }),
    body("password").custom(async (value, { req }) => {
      if (!req.temporaryUser) {
        return Promise.reject("Invalid email or password.");
      }

      const doMatch = await bcrypt.compare(value, req.temporaryUser.password);
      if (!doMatch) {
        return Promise.reject("Invalid email or password.");
      }

      console.log(`Successfully logged in! ID: ${req.temporaryUser._id}`);
      return true;
    }),
  ],
  authController.postLogin
);

router.post("/logout", authController.postLogout);

router.get("/signup", authController.getSignup);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom(async (value, { req }) => {
        const userDoc = await User.findOne({ email: value });
        if (userDoc) {
          return Promise.reject("The email is already taken");
        }
      }),
    body("password", "Password should be more than 6 characters.").isLength({
      min: 5,
    }),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords does not match.");
      }

      return true;
    }),
  ],
  authController.postSignup
);

router.get("/reset-pass", authController.getResetPass);

router.post("/reset-pass", authController.postResetPass);

router.get("/reset-pass/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

router.get("/success", signupSuccess, authController.getSuccess);

module.exports = router;
