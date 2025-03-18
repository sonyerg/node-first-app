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
    body("email", "Invalid email or password.").isEmail().normalizeEmail(),
    body("password", "Invalid email or password.").isLength({ min: 3 }).trim(),
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
          return Promise.reject("This email is already taken.");
        }
      }).normalizeEmail(),
    body("password", "Password should be more than 6 characters.").isLength({
      min: 5,
    }).trim(),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords does not match.");
      }

      return true;
    }).trim(),
  ],
  authController.postSignup
);

router.get("/reset-pass", authController.getResetPass);

router.post("/reset-pass", authController.postResetPass);

router.get("/reset-pass/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

router.get("/success", signupSuccess, authController.getSuccess);

module.exports = router;
