const express = require("express");
const {
  addProduct,
  updateProductStatus,
  getFaultyProducts,
} = require("../controllers/productController");

const router = express.Router();

// API Routes for Products in Order Management
router.post("/add", addProduct); // Add a product
router.put("/update-status/:id", updateProductStatus); // Change product status
router.get("/faulty", getFaultyProducts); // Get all faulty products

module.exports = router;
