// [SECTION] Dependencies and Modules
const express = require("express");
const userController = require("../controllers/user");
const {verify, verifyAdmin} = require("../middlewares/auth");

// [SECTION] Routing Component
const router = express.Router();

// [USER REGISTRATION - NORMAL USER - HUI ANGELES]
router.post("/", userController.registerUser);

// [USER REGISTRATION - ADMIN - HUI ANGELES]
router.post("/admin", userController.registerAdmin);

// [USER AUTHENTICATION - HUI ANGELES]
router.post("/login", userController.loginUser)

// [RETRIEVE USER DETAILS - FROILAN OLIQUIANO]
router.get("/details", verify, userController.getProfile);

// [RETRIEVE ALL USERS - HUI ANGELES]
router.get("/all-users", verify, verifyAdmin, userController.getAllUsers);

// [UPDATE USER AS ADMIN - ADMIN ONLY - FROILAN OLIQUIANO]
router.patch("/:userId/set-as-admin", verify, verifyAdmin, userController.adminUpdate);

// [UNSET USER AS ADMIN - ADMIN ONLY - HUI ANGELES]
router.patch("/:userId/unset-as-admin", verify, verifyAdmin, userController.unsetAdmin);

// [UPDATE PASSWORD - FROILAN OLIQUIANO]
router.put("/update-password", verify, userController.updatePassword)

// [FORGET PASSWORD - HUI ANGELES]
router.put("/forget-password", userController.forgetPassword)

// [UPDATE USER PROFILE - HUI ANGELES]
router.put("/update-profile", verify, userController.updateProfile);

module.exports = router;