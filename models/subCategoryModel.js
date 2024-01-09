const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "SubCategory name is required"],
      trim: true,
      unique: [true, "SubCategory name must be unique"],
      minlength: [2, "SubCategory name must be at least 2 characters"],
      maxlength: [32, "SubCategory name must be less than 32 characters"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  { timestamps: true }
);

const SubCategoryModel = mongoose.model("SubCategory", subCategorySchema);
module.exports = SubCategoryModel;
