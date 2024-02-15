// [SECTION] Dependencies and Modules
const express = require("express");
const orderController = require("../controllers/order");
const {verify, verifyAdmin} = require("../middlewares/auth");

// [SECTION] Routing Component
const router = express.Router();

// [PAYMENT METHOD LIST - HUI ANGELES]
router.get("/payment-methods", verify, orderController.paymentMethod)

// [ORDER CREATION - HUI ANGELES]
router.post("/checkout", verify, orderController.checkOutOrder);

// [RETRIEVE USER PERSONAL ORDER - HUI ANGELES]
router.get("/my-orders", verify, orderController.myOrders);

// [RETRIEVE ALL USERS ORDER - HUI ANGELES]
router.post("/all-orders", verify, verifyAdmin, orderController.allOrders);

module.exports = router;