const Product = require("../models/Product");
const Manufacturer = require("../models/Manufacturer");
const Customer = require("../models/Customer");
const Seller = require("../models/Seller");

// ➕ 1. Add a Product
const addProduct = async (req, res) => {
  try {
    const { name, manufacturer, seller, price, status, userId, userType } =
      req.body;

    if (!name || !manufacturer || !seller || !price) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const product = new Product({
      name,
      manufacturer,
      seller,
      price,
      status,
      lastUpdatedBy: { userId: userId, userType: userType },
    });

    await product.save();
    res.status(201).json({ message: "Product added successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ➕ 2. Update Product Status (Only Manufacturer or Seller can update)
const updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, userId, userType } = req.body;

    if (!["instock", "outofstock", "faulty"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Ensure `userType` is either "manufacturer" or "seller"
    if (!["manufacturer", "seller"].includes(userType)) {
      return res.status(403).json({
        message:
          "Unauthorized: Only Manufacturers or Sellers can update the product status",
      });
    }

    // Find the product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if the user is the correct manufacturer or seller
    const isAuthorized =
      (userType === "manufacturer" &&
        String(product.manufacturer) === userId) ||
      (userType === "seller" && String(product.seller) === userId);

    if (!isAuthorized) {
      return res
        .status(403)
        .json({ message: "Unauthorized: You do not own this product" });
    }

    // Update the product status and track who updated it
    product.status = status;
    product.lastUpdatedBy = { userId, userType };
    await product.save();

    res.status(200).json({ message: "Product status updated", product });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ➕ 3. Get Faulty Products with Last Updated Details
const getFaultyProducts = async (req, res) => {
  try {
    const faultyProducts = await Product.find({ status: "faulty" });

    // Fetch full details of the lastUpdatedBy (either Manufacturer or Seller)
    const productsWithUserDetails = await Promise.all(
      faultyProducts.map(async (product) => {
        let userDetails = null;

        if (product.lastUpdatedBy && product.lastUpdatedBy.userId) {
          if (product.lastUpdatedBy.userType === "manufacturer") {
            userDetails = await Manufacturer.findById(
              product.lastUpdatedBy.userId
            );
          } else if (product.lastUpdatedBy.userType === "seller") {
            userDetails = await Seller.findById(product.lastUpdatedBy.userId);
          }
        }

        return {
          ...product.toObject(),
          lastUpdatedBy: userDetails,
        };
      })
    );

    res.status(200).json(productsWithUserDetails);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = { addProduct, updateProductStatus, getFaultyProducts };
