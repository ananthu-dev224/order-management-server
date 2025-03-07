const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    manufacturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Manufacturer",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["instock", "outofstock", "faulty"],
      default: "instock",
    },
    lastUpdatedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, required: true },
      userType: {
        type: String,
        enum: ["manufacturer", "seller"],
        required: true,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
