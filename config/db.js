const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    const url = process.env.MONGO_URL;
    await mongoose.connect(url);
    console.log("Mongo Db connected");
  } catch (err) {
    console.log(err);
  }
};

module.exports = connectDb;
