const express = require("express");

const {
    getUser,
    getLoggedUserData,
    getAllUsers,
    updateUser,
    updateUserRole,
    deactvateLoggedUser,
    reactivateUser,
    getDeactivatedUsers,
    deleteLoggedUser,
    searchUsers,
} = require("../services/userService");

const {
    idUserValidator,
    updateUserValidator,
} = require("../utils/validators/userValidator");

const { protect, allowedTo } = require("../services/authService");
const router = express.Router();

router.use(protect);

router.get("/getMe", getLoggedUserData);

router.put("/updateMe", updateUserValidator, updateUser);

router.put("/deactivateMe", deactvateLoggedUser);

router.delete("/deleteMe", deleteLoggedUser);

router.get("/search", searchUsers);

//-------------------only for admin ---------------------
router.use(allowedTo("admin"));

router.put("/updateRole/:id", idUserValidator, updateUserRole);
router.put("/reactivate/:id", idUserValidator, reactivateUser);
router.get("/deactivated", getDeactivatedUsers);
router.get("/all", getAllUsers);
router.get("/:id", idUserValidator, getUser);

module.exports = router;
