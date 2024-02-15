// [SECTION] Dependencies and Modules
const express = require("express");
const cartController = require("../controllers/cart");
const {verify, verifyAdmin} = require("../middlewares/auth");

// [SECTION] Routing Component
const router = express.Router();

// [GET USERS CART - FROILAN OLIQUIANO]
router.get("/get-cart", verify, cartController.getCart);

// [ADD TO CART - HUI ANGELES]
router.post("/add-to-cart", verify, cartController.addToCart);

// [UPDATE QUANTITY - HUI ANGELES]
router.put("/update-cart-quantity", verify, cartController.updateCartQuantity);

// [REMOVE PRODUCTS FROM CART - HUI ANGELES]
router.put("/:productId/remove-from-cart", verify, cartController.removeItem);

// [CLEAR CART - HUI ANGELES]
router.put("/clear-cart", verify, cartController.clearCart);

module.exports = router;