const { body, param } = require("express-validator");
const validatorMiddleware = require("../../middlewares/validatorMiddelware");
const CategoryModel = require("../../models/categoryModel");
const subCategoryModel = require("../../models/subCategoryModel");

exports.createProductValidationRules = [
  body("title")
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters")
    .notEmpty()
    .withMessage("Title is required"),
  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ max: 2000 })
    .withMessage("Description must be less than 2000 characters"),
  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required")
    .isNumeric()
    .withMessage("Quantity must be a number"),
  body("sold").optional().isNumeric().withMessage("Sold must be a number"),
  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isNumeric()
    .withMessage("Price must be a number")
    .isLength({ max: 32 })
    .withMessage("Price must be less than 32 characters"),
  body("priceAfterDiscount")
    .optional()
    .isNumeric()
    .withMessage("Price after discount must be a number")
    .toFloat()
    .custom((value, { req }) => {
      if (req.body.price <= value) {
        throw new Error("priceAfterDiscount must be lower than price");
      }
      return true;
    }),
  body("colors").optional().isArray().withMessage("Colors must be an array"),
  body("imageCover").notEmpty().withMessage("Image cover is required"),
  body("images").optional().isArray().withMessage("Images must be an array"),
  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isMongoId()
    .withMessage("Invalid Category ID Format")
    .custom((value, { req }) => {
      return CategoryModel.findById(value).then((category) => {
        if (!category) {
          return Promise.reject("No Category for this ID ");
        }
      });
    }),
  body("subcategories")
    .optional()
    .isMongoId()
    .withMessage("Invalid Sub Category ID Format")
    .custom((subCategoryids) => {
      return subCategoryModel
        .find({ _id: { $exists: true, $in: subCategoryids } })
        .then((result) => {
          if (result.length !== subCategoryids.length || result.length === 0) {
            return Promise.reject("Invalid Sub Categories IDs");
          }
        });
    })
    .custom((val, { req }) =>
      subCategoryModel
        .find({ category: req.body.category })
        .then((subcategories) => {
          const subCategoriesIdsInDB = [];
          subcategories.forEach((subCategory) => {
            subCategoriesIdsInDB.push(subCategory._id.toString());
          });
          // check if subcategories ids in db include subcategories in req.body (true)
          const checker = (target, arr) => target.every((v) => arr.includes(v));
          if (!checker(val, subCategoriesIdsInDB)) {
            return Promise.reject(
              new Error(`subcategories not belong to category`)
            );
          }
        })
    ),
  body("brand").optional().isMongoId().withMessage("Invalid Brand ID Format"),
  body("ratingsAverage")
    .optional()
    .isNumeric()
    .withMessage("Ratings average must be a number")
    .isLength({ min: 1 })
    .withMessage("Ratings average must be at least 1")
    .isLength({ max: 5 })
    .withMessage("Ratings average must be less than 5"),
  body("ratingsQuantity")
    .optional()
    .isNumeric()
    .withMessage("Ratings quantity must be a number"),

  validatorMiddleware,
];

exports.getProductValidationRules = [
  param("id").isMongoId().withMessage("Invalid Product ID Format"),
  validatorMiddleware,
];

exports.updateProductValidationRules = [
  param("id").isMongoId().withMessage("Invalid Product ID Format"),
  validatorMiddleware,
];

exports.deleteProductValidationRules = [
  param("id").isMongoId().withMessage("Invalid Product ID Format"),
  validatorMiddleware,
];
