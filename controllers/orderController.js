const Order = require("../models/Order");

// ➕ 1. All orders
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const orders = await Order.find()
      .populate({
        path: "product",
        populate: [{ path: "manufacturer" }, { path: "seller" }],
      })
      .populate("customer")
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalOrders = await Order.countDocuments();

    res.status(200).json({
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: parseInt(page),
      orders,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ➕ 1. Most ordered products list
const getMostOrderedProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);

    const mostOrderedProducts = await Order.aggregate([
      {
        $group: {
          _id: "$product",
          orderCount: { $sum: 1 },
        },
      },
      {
        $sort: { orderCount: -1 },
      },
      {
        $lookup: {
          from: "products",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", { $toObjectId: "$$productId" }] },
              },
            },
          ],
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          orderCount: 1,
          productName: "$productDetails.name",
          price: "$productDetails.price",
          status: "$productDetails.status",
        },
      },
      {
        $skip: (pageNumber - 1) * pageSize,
      },
      {
        $limit: pageSize,
      },
    ]);

    res
      .status(200)
      .json({ message: "Most Ordered Products", data: mostOrderedProducts });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ➕ 1. Order revenue by month
const getOrdersAndRevenueByMonth = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query; // Default: Last 12 months
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);

    const ordersByMonth = await Order.aggregate([
      {
        $addFields: { createdAt: { $toDate: "$createdAt" } },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
      {
        $sort: { "_id.year": -1, "_id.month": -1 },
      },
      {
        $skip: (pageNumber - 1) * pageSize,
      },
      {
        $limit: pageSize,
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          totalOrders: 1,
          totalRevenue: 1,
        },
      },
    ]);

    res
      .status(200)
      .json({ message: "Orders & Revenue by Month", data: ordersByMonth });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  getAllOrders,
  getMostOrderedProducts,
  getOrdersAndRevenueByMonth,
};
