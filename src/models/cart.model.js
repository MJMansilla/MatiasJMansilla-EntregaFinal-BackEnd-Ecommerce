const mongoose = require("mongoose");
const { Schema, Types } = mongoose;
const cartSchema = new Schema(
  {
    products: [
      {
        product: { type: Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, default: 1, min: 1 },
      },
    ],
  },
  { timestamps: true }
);
module.exports = mongoose.model("Cart", cartSchema);
