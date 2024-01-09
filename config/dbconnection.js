const mongoose = require("mongoose");

const dbConnection = () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then((connection) => {
      console.log("connected to database");
    })
};
module.exports = dbConnection