const express = require("express");
const {
    uploadProfileImage,
    signup,
    verifyEmailUser,
    protectforget,
    protectCode,
    login,
    forgetPassword,
    verifyPassResetCode,
    resetPassword,
} = require("../services/authService");

const {
    signupUserValidator,
    loginValidator,
    resetValidator,
} = require("../utils/validators/authValidator");

const router = express.Router();

router.post(
    "/signup",
    signupUserValidator,
    uploadProfileImage,
    signup
);
router.post("/verifyEmailUser", protectCode, verifyEmailUser);

router.post("/login", loginValidator, login);

router.post("/forgetpass", forgetPassword);
router.post("/verifycode", protectforget, verifyPassResetCode);
router.put("/resetpassword", protectforget, resetValidator, resetPassword);

module.exports = router;
