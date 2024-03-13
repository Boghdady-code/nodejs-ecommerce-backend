const ApiError = require("../utils/apiError");
const asyncHandler = require("express-async-handler");
const CartModel = require("../models/cartModel");
const ProductModel = require("../models/productModel");
const CouponModel = require("../models/couponModel");

exports.addToCart = asyncHandler(async (req, res, next) => {
  const product = await ProductModel.findById(req.body.productId);
  const quantity = req.body.quantity;

  let cart = await CartModel.findOne({ user: req.user._id });
  if (!cart) {
    cart = await CartModel.create({
      user: req.user._id,
      cartItems: [
        {
          product: req.body.productId,
          color: req.body.color,
          price: product.price,
          productImage: product.imageCover,
          quantity: req.body.quantity,
        },
      ],
    });
  } else {
    const itemIndex = cart.cartItems.findIndex(
      (item) =>
        item.product.toString() === req.body.productId &&
        item.color === req.body.color
    );
    if (itemIndex > -1) {
      cartItem = cart.cartItems[itemIndex];
      cartItem.quantity += 1;
      cart.cartItems[itemIndex] = cartItem;
    } else {
      cart.cartItems.push({
        product: req.body.productId,
        color: req.body.color,
        price: product.price,
        productImage: product.imageCover,
        quantity: req.body.quantity,
      });
    }
  }

  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.price * item.quantity;
  });

  cart.totalPrice = totalPrice;
  cart.priceAfterDiscount = undefined;

  await cart.save();

  res.status(200).json({
    status: "success",
    message: "Product added to cart successfully",
    data: {
      cart,
    },
  });
});

exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const cart = await CartModel.findOne({ user: req.user._id });
  if (!cart) {
    return next(new ApiError("There's no cart for this user yet", 404));
  }
  res.status(200).json({
    status: "success",
    numberOfItems: cart.cartItems.length,
    data: cart,
  });
});

exports.removeSpecificCartItem = asyncHandler(async (req, res, next) => {
  const cart = await CartModel.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: { cartItems: { _id: req.params.itemId } },
    },
    { new: true }
  );

  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.price * item.quantity;
  });

  cart.totalPrice = totalPrice;
  cart.priceAfterDiscount = undefined;

  cart.save();

  if (!cart) {
    return next(new ApiError("Cart not found", 404));
  }
  res.status(200).json({
    status: "success",
    message: "Cart item removed successfully",
    numberOfItems: cart.cartItems.length,
    data: cart,
  });
});

exports.clearCart = asyncHandler(async (req, res, next) => {
  const cart = await CartModel.findOneAndDelete({ user: req.user._id });
  res.status(200).json({
    status: "success",
    message: "Cart cleared successfully",
  });
});

exports.updateQuantity = asyncHandler(async (req, res, next) => {
  const cart = await CartModel.findOne({ user: req.user._id });
  if (!cart) {
    return next(new ApiError("Cart not found", 404));
  } else {
    const itemIndex = cart.cartItems.findIndex(
      (item) => item._id.toString() === req.params.itemId
    );
    if (itemIndex > -1) {
      cartItem = cart.cartItems[itemIndex];
      cartItem.quantity = req.body.quantity;
      cart.cartItems[itemIndex] = cartItem;
    } else {
      return next(new ApiError("Cart item not found", 404));
    }
  }
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.price * item.quantity;
  });
  cart.totalPrice = totalPrice;
  cart.priceAfterDiscount = undefined;

  await cart.save();
  res.status(200).json({
    status: "success",
    message: "Cart item quantity updated successfully",
    numberOfItems: cart.cartItems.length,
    data: cart,
  });
});

exports.applyCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await CouponModel.findOne({
    name: req.body.coupon,
    expires: { $gte: Date.now() },
  });
  if (!coupon) {
    return next(new ApiError("Coupon is invalid or expired", 404));
  }
  const cart = await CartModel.findOne({ user: req.user._id });
  const totalPrice = cart.totalPrice;
  const discount = ((totalPrice * coupon.discount) / 100).toFixed(2);
  const priceAfterDiscount = totalPrice - discount;
  cart.priceAfterDiscount = priceAfterDiscount;
  await cart.save();

  res.status(200).json({
    status: "success",
    message: "Coupon applied successfully",
    data: {
      cart,
    },
  });
});
