// [SECTION] Dependencies and Modules
const express = require("express");
const productController = require("../controllers/product");
const {verify, verifyAdmin} = require("../middlewares/auth");

// [SECTION] Routing Component
const router = express.Router();

// [PRODUCT CREATION - HUI ANGELES]
router.post("/", verify, verifyAdmin, productController.createProduct);

// [RETRIEVING ALL PRODUCTS - HUI ANGELES]
router.get("/all", verify, verifyAdmin, productController.retrieveProduct);

// [RETRIEVING ACTIVE PRODUCTS - HUI ANGELES]
router.get("/", productController.getActiveProduct);

// [RETRIEVING SINGLE PRODUCT - FROILAN OLIQUIANO] 
router.post("/:productId", productController.getProduct);

// [UPDATE PRODUCT INFORMATION - FROILAN OLIQUIANO]  
router.patch("/:productId/update", verify, verifyAdmin, productController.updateProduct);

// [ARCHIVE PRODUCT - HUI ANGELES] 
router.patch("/:productId/archive", verify, verifyAdmin, productController.archiveProduct);

// [ACTIVATE PRODUCT - FROILAN OLIQUIANO] 
router.patch("/:productId/activate", verify, verifyAdmin, productController.activateProduct);

// [SEARCH PRODUCT BY NAME - FROILAN OLIQUIANO]
router.post("/products/searchByName", productController.searchProductByName);

// [SEARCH PRODUCT BY PRICE -  FROILAN OLIQUIANO]
router.post("/products/searchByPrice", productController.searchProductByPrice);

// [SEARCH PRODUCT BY CATEGORY - HUI ANGELES]
router.post("/products/searchByCategory", productController.searchProductByCategory);


module.exports = router;