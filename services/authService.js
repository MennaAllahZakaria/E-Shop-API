const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const CryptoJs = require("crypto-js");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/ApiError");
const sendEmail = require("../utils/sendEmail");
const createToken = require("../utils/createToken");

const Verification = require("../models/codeModel");
const User = require("../models/userModel");
const { sanitizeUser } = require("../utils/sanitizeData");

exports.signup = asyncHandler(async (req, res, next) => {
  const check = await Verification.findOne({
    email: req.body.email,
  });

  if (check) {
    await Verification.deleteOne({ _id: check._id });

    // return next(new ApiError("Code has already been sent to this email", 400)); // تغيير حالة الخطأ إلى 400
  }

  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  const expirationTime = Date.now() + 10 * 60 * 1000; // 10 minutes

  const hashResetCode = crypto
    .createHash("sha256")
    .update(verificationCode)
    .digest("hex");
  // Send verification code to the user's email (as done before)
  const message = `Hi ${req.body.firstName} ${req.body.lastName},\nWe received a request to verify your E-Shop Account. \n${verificationCode} \nEnter this code to complete the verify. \nThanks for helping us keep your account secure.\nThe E-shop Team `;
  // Send verification code to the user's email
  try {
    // console.log("Sending email to:", req.body.Email);
    await sendEmail({
      Email: req.body.email,
      subject: "Email Verification Code (valid for 10 min)",
      message,
    });
    const { passwordConfirm, password, ...tempUserData } = req.body;
    //comment
    // تحقق إذا كانت كلمة المرور موجودة ثم عمل هاش لها
    if (password) {
      const saltRounds = parseInt(process.env.HASH_PASS, 10); // عدد الـ salt rounds من البيئة
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // تخزين كلمة المرور المجهزة (المشفرّة) في البيانات
      tempUserData.password = hashedPassword;
    }
    // Save the code and temp data in the database
    const verification = await Verification.create({
      email: req.body.email,
      code: hashResetCode,
      expiresAt: new Date(expirationTime),
      tempUserData: tempUserData,
    });
    const token = createToken(verification._id);
    res.status(200).json({
      status: "success",
      message: "Verification code sent to your email.",
      token,
    });
  } catch {
    return next(new ApiError("There is an error in sending email", 500));
  }
});

exports.verifyEmailUser = asyncHandler(async (req, res, next) => {
  const check = await Verification.findById(req.code._id);
  const { code } = req.body;
  const hashResetCode = crypto.createHash("sha256").update(code).digest("hex");
  const email = check.email;
  const verificationRecord = await Verification.findOne({
    email,
    code: hashResetCode,
  });

  if (!verificationRecord) {
    return next(new ApiError("Invalid verification code", 400));
  }

  // Create the user in the database
  const user = await User.create({
    ...verificationRecord.tempUserData, // نسخ جميع البيانات من tempStudentData
  });

  // Clear verification record
  await Verification.deleteOne({ _id: verificationRecord._id });

  const token = createToken(user._id);

  res.status(201).json({
    status: "success",
    data: sanitizeUser(user),
    token,
  });
});

exports.login = asyncHandler(async (req, res, next) => {
  //1)check if password and email in the body (validation)
  //2)check if user exists and check if password is correct
  const user = await User.findOne({
    email: req.body.email,
  });

  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Incorrect email or password", 401));
  }

  //3)Generation token
  const token = createToken(user._id);
  return res.status(201).json({
    data: sanitizeUser(user),
    token,
  });
});

exports.protect = asyncHandler(async (req, res, next) => {
  //1)check if token exists, if exists get
  let token;

  if (req.headers.authorization) {
    token = req.headers.authorization;
  }
  if (!token) {
    return next(
      new ApiError(
        "you are not login, please login to get accsess this route",
        401
      )
    );
  }
  //2) verify token (no change happens, expired token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  //3) check if user exists
  const currentUser = await User.findById(decoded.userId);
  // console.log(currentUser.passwordChangeAt.getTime());
  if (!currentUser) {
    return next(
      new ApiError("The user that belong to this token does no longer exist"),
      401
    );
  }

  //4)check the user is active or no
  if (!currentUser.active) {
    return next(
      new ApiError("The user that belong to this token no active now"),
      401
    );
  }
  //5) check if user change his password after token created
  if (currentUser.passwordChangeAt) {
    const passChangedTimestamp = parseInt(
      currentUser.passwordChangeAt / 1000,
      10
    );
    //Password changed after token created (Error)
    if (passChangedTimestamp > decoded.iat) {
      return next(
        new ApiError("Your password has changed recently, please login again"),
        401
      );
    }
  }
  req.user = currentUser;
  next();
});

exports.protectforget = asyncHandler(async (req, res, next) => {
  //1)check if token exists, if exists get
  let token;

  if (req.headers.authorization) {
    token = req.headers.authorization;
  }
  if (!token) {
    return next(
      new ApiError(
        "you are not login, please login to get accsess this route",
        401
      )
    );
  }
  //2) verify token (no change happens, expired token)
  token = CryptoJs.AES.decrypt(token, process.env.HASH_PASS);
  token = token.toString(CryptoJs.enc.Utf8);
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  //3) check if user exists
  const currentUser = await User.findById(decoded.userId);
  // console.log(currentUser.passwordChangeAt.getTime());
  if (!currentUser) {
    return next(
      new ApiError("The user that belong to this token does no longer exist"),
      401
    );
  }

  //4)check the user is active or no
  if (!currentUser.active) {
    return next(
      new ApiError("The user that belong to this token no active now"),
      401
    );
  }
  //5) check if user change his password after token created
  if (currentUser.passwordChangeAt) {
    const passChangedTimestamp = parseInt(
      currentUser.passwordChangeAt / 1000,
      10
    );
    //Password changed after token created (Error)
    if (passChangedTimestamp > decoded.iat) {
      return next(
        new ApiError("Your password has changed recently, please login again"),
        401
      );
    }
  }
  req.user = currentUser;
  next();
});

exports.protectCode = asyncHandler(async (req, res, next) => {
  //1)check if token exists, if exists get
  let token;

  if (req.headers.authorization) {
    token = req.headers.authorization;
  }
  if (!token) {
    return next(
      new ApiError(
        "you are not login, please login to get accsess this route",
        401
      )
    );
  }
  //2) verify token (no change happens, expired token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  //3) check if user exists
  const currentCode = await Verification.findById(decoded.userId);
  // console.log(currentUser.passwordChangeAt.getTime());
  if (!currentCode) {
    return next(
      new ApiError("The user that belong to this token does no longer exist"),
      401
    );
  }

  if (Date.now() > currentCode.expiresAt) {
    return next(new ApiError("Verification code expired", 400));
  }

  req.code = currentCode;
  next();
});

//["user", "admin"]
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    //1) access roles
    //2) access registered user (req.user.role)
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You are not allowed to access this this route", 403)
      );
    }
    next();
  });

exports.forgetPassword = asyncHandler(async (req, res, next) => {
  //1)get user by email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new ApiError(`There is no user with that email ${req.body.email}`, 404)
    );
  }
  //2) if user exit, generate reset random 6 digits and save it in db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  //Save hashed password reset code into db
  user.passwordResetCode = hashResetCode;
  //Add expiration time for password reset code (10 min)
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;

  await user.save();

  const message = `Hi ${user.firstName} ${user.lastName},\nWe received a  request to reset the password on your E-shop Account. \n${resetCode} \nEnter this code to complete the reset. \nThanks for helping us keep your account secure.\nThe E-Shop Team `;
  //3) Send the reset code via email
  try {
    await sendEmail({
      Email: user.email,
      subject: "Your password reset code (valid for 10 min)",
      message,
    });
  } catch {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();
    return next(new ApiError("There is an error in sending email", 500));
  }
  token = createToken(user._id);

  token = CryptoJs.AES.encrypt(token, process.env.HASH_PASS).toString();
  res
    .status(200)
    .json({ status: "Success", message: "Reset code sent to email", token });
});

exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
  //1)Get user based on reset code
  const hashResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await User.findById(req.user._id);
  if (
    user.passwordResetCode != hashResetCode ||
    user.passwordResetExpires <= Date.now()
  ) {
    return next(new ApiError("Reset code invalid or expired"), 401);
  }

  //2) Reset code valid
  user.passwordResetVerified = true;
  await user.save();
  const token = req.headers.authorization;

  res.status(200).json({
    status: "Success",
    token,
  });
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  //1)Get user based on email
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new ApiError(`There is no user with email ${user.Email}`, 404));
  }

  //2) Check if reset code verified
  if (!user.passwordResetVerified) {
    return next(new ApiError(`Reset code not verified`, 400));
  }

  const { newPassword } = req.body;

  // تحقق إذا كانت كلمة المرور موجودة ثم عمل هاش لها
  if (newPassword) {
    const saltRounds = parseInt(process.env.HASH_PASS, 10); // عدد الـ salt rounds من البيئة
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // تخزين كلمة المرور المجهزة (المشفرّة) في البيانات
    user.password = hashedPassword;
  }

  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;

  await user.save();

  //3) if everything is ok, generate token
  const token = createToken(user._id);
  res.status(200).json({ token });
});
