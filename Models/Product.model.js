import mongoose from "mongoose";

const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      uppercase: true,
      required: true,
    },
    madeIn: {
      type: String,
      lowercase: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
