const express = require("express");

const authController = require("../controllers/auth");

const router = express.Router();

router.get("/login", authController.getLogin);

router.post("/login", authController.postLogin);

router.post("/logout", authController.postLogout);

router.get("/signup", authController.getSignup);

router.post("/signup", authController.postSignup);

router.get("/reset-pass", authController.getResetPass);

router.post("/reset-pass", authController.postResetPass);

router.get("/reset-pass/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword)

module.exports = router;
