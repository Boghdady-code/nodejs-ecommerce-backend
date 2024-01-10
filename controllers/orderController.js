const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const orderModel = require("../models/orderModel");
const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");

exports.createCashOrder = asyncHandler(async (req, res, next) => {
  const shippingPrice = 0;
  const taxPrice = 0;
  const cart = await cartModel.findById(req.params.cartId);
  if (!cart) {
    return next(new ApiError("There is no cart for this ID", 404));
  }

  const cartPrice = cart.priceAfterDiscount
    ? cart.priceAfterDiscount
    : cart.totalPrice;
  const totalOrderPrice = cartPrice + shippingPrice + taxPrice;

  const order = await orderModel.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
  });
  if (order) {
    const bulkOpts = cart.cartItems.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
        },
      };
    });

    await productModel.bulkWrite(bulkOpts, {});

    await cartModel.findByIdAndDelete(req.params.cartId);
  }
  res.status(201).json({
    status: "success",
    message: "Order created successfully",
    data: order,
  });
});

exports.getLoggedUserOrders = asyncHandler(async (req, res, next) => {
  if (req.user.role === "user") {
    req.filterObj = { user: req.user._id };
  }
  next();
});

exports.getAllOrders = asyncHandler(async (req, res, next) => {
  let filterObj = {};
  if (req.filterObj) {
    filterObj = req.filterObj;
  }
  const orders = await orderModel.find(filterObj);
  res.status(200).json({
    status: "success",
    data: orders,
  });
});

exports.getSpecificOrder = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const order = await orderModel.findById(id);
  if (!order) {
    return next(new ApiError("Order not found", 404));
  }
  res.status(200).json({
    status: "success",
    data: order,
  });
});

exports.updatePaidStatus = asyncHandler(async (req, res, next) => {
  const order = await orderModel.findById(req.params.id);
  if (!order) {
    return next(new ApiError("Order not found", 404));
  }
  order.isPaid = true;
  order.paidAt = Date.now();
  await order.save();
  res.status(200).json({
    status: "success",
    message: "Order paid successfully",
    data: order,
  });
});

exports.updateDeliveredStatus = asyncHandler(async (req, res, next) => {
  const order = await orderModel.findById(req.params.id);
  if (!order) {
    return next(new ApiError("Order not found", 404));
  }
  order.isDelivered = true;
  order.deliveredAt = Date.now();
  await order.save();
  res.status(200).json({
    status: "success",
    message: "Order delivered successfully",
    data: order,
  });
});

exports.checkoutSession = asyncHandler(async (req, res, next) => {
  const shippingPrice = 0;
  const taxPrice = 0;
  const cart = await cartModel.findById(req.params.cartId);
  if (!cart) {
    return next(new ApiError("There is no cart for this ID", 404));
  }

  const cartPrice = cart.priceAfterDiscount
    ? cart.priceAfterDiscount
    : cart.totalPrice;
  const totalOrderPrice = cartPrice + shippingPrice + taxPrice;

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: req.user.name,
          },
          unit_amount: totalOrderPrice * 100,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/orders`,
    cancel_url: `${req.protocol}://${req.get("host")}/cart`,
    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata: req.body.shippingAddress,
  });

  res.status(200).json({
    status: "success",
    data: {
      session,
    },
  });
});

exports.webhookCheckout = asyncHandler(async (req, res, next) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === "checkout.session.completed") {
    console.log("create order here");
  }
});
