const express = require("express");
const {
  getMostOrderedProducts,
  getAllOrders,
  getOrdersAndRevenueByMonth,
} = require("../controllers/orderController");

const router = express.Router();

router.get("/all-orders", getAllOrders); // Get all orders
router.get("/most-ordered", getMostOrderedProducts); // Get most ordered products as list
router.get("/order-revenue", getOrdersAndRevenueByMonth); // Get order revenue based on each month

module.exports = router;
