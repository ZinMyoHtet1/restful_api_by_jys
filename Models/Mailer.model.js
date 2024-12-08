import mongoose from "mongoose";

const Schema = mongoose.Schema;

const mailerSchema = new Schema(
  {
    to: {
      type: String,
      lowercase: true,
      required: true,
    },
    subject: {
      type: String,
    },
    text: {
      type: String,
    },
  },
  { timestamps: true }
);

export default new mongoose.model("Mail", mailerSchema);
