const ApiError = require("../utils/apiError");
const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (err.name == "JsonWebTokenError") {
    err = new ApiError("Invalid token. Please login again", 401);
  }
  if (err.name == "TokenExpiredError") {
    err = new ApiError("Token expired. Please login again", 401);
  }

  return res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    stack: err.stack,
  });
};

module.exports = globalError;
