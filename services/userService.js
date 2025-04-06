const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/ApiError");

const User = require("../models/userModel");

const { sanitizeUser, sanitizeUsers } = require("../utils/sanitizeData");

const HandlerFactory = require("./handlerFactory");

// @desc    Get user by ID
// @route   GET /users/:id
// @access  Private/admin

exports.getUser = HandlerFactory.getOne(User);

// @desc    Get information of logged user
// @route   GET /users/getMe
// @access  Private/user

exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ApiError(`No user found with id ${req.user.id}`, 404));
  }

  res.status(200).json({ data: sanitizeUser(user) });
});

// @desc    Get all users
// @route   GET /users/all
// @access  Private/user

exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find();
  if (!users.length) {
    return next(new ApiError(`No users found`, 404));
  }
  res.status(200).json({ results: users.length, data: sanitizeUsers(users) });
});

// @desc    Update user without password or role
// @route   PUT /users/updateMe
// @access  Private/user

exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    },
    {
      new: true,
    }
  );

  if (!user) {
    return next(new ApiError(`No user for this id ${req.user.id}`, 404));
  }
  res.status(200).json({ data: sanitizeUser(user) });
});

// @desc    Update user  role
// @route   PUT /users/updateRole/:id
// @access  Private/admin

exports.updateUserRole = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ApiError(`No user for this id ${req.params.id}`, 404));
  }

  const newRole = user.role === "admin" ? "user" : "admin";
  await User.findByIdAndUpdate(
    req.params.id,
    {
      role: newRole,
    },
    {
      new: true,
    }
  );

  res.status(204).json({ msg: "Role updated" });
});

// @desc    Deactvate logged user
// @route   PUT /users/deactvateMe
// @access  Private/protect

exports.deactvateLoggedUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      active: false,
    },
    {
      new: true,
    }
  );

  res.status(204).json({ msg: "Deactivated" });
});

// @desc    Reactivate a user
// @route   PUT /users/reactivate/:id
// @access  Private/admin
exports.reactivateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ApiError(`No user found with id ${req.params.id}`, 404));
  }

  await User.findByIdAndUpdate(req.params.id, { active: true }, { new: true });

  res.status(200).json({ msg: "User reactivated" });
});

// @desc    Get all deactivated users
// @route   GET /users/deactivated
// @access  Private/admin
exports.getDeactivatedUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({ active: false });
  if (!users.length) {
    return next(new ApiError(`No deactivated users found`, 404));
  }
  res.status(200).json({ results: users.length, data: sanitizeUsers(users) });
});

// @desc    Delete logged user
// @route   DELETE /users/deleteMyAccount
// @access  Private/protect

exports.deleteLoggedUser = asyncHandler(async (req, res, next) => {
  await Baby.deleteMany({ motherOfBaby: req.user._id });
  await User.findByIdAndDelete(req.user._id);

  res.status(204).json({ msg: "Deleted" });
});

// @desc    Search users
// @route   GET /users/search
// @access  Private/user
exports.searchUsers = asyncHandler(async (req, res, next) => {
  const { query } = req.query;
  const users = await User.find({
    $or: [
      { firstName: { $regex: query, $options: "i" } },
      { lastName: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } },
    ],
  });

  if (!users.length) {
    return next(new ApiError(`No users found matching ${query}`, 404));
  }
  res.status(200).json({ data: sanitizeUsers(users) });
});
