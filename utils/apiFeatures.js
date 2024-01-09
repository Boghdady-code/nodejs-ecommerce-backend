class ApiFeatures {
  constructor(mongoQuery, reqQuery) {
    this.mongoQuery = mongoQuery;
    this.reqQuery = reqQuery;
  }

  filter() {
    const filterationQuery = { ...this.reqQuery };
    const excludeFields = ["sort", "page", "limit", "fields", "keyword"];
    excludeFields.forEach((field) => delete filterationQuery[field]);
    //applying  fileration properties
    let filterationString = JSON.stringify(filterationQuery);
    filterationString = filterationString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    this.mongoQuery = this.mongoQuery.find(JSON.parse(filterationString));
    return this;
  }

  sort() {
    if (this.reqQuery.sort) {
      const sortBy = this.reqQuery.sort.split(",").join(" ");
      this.mongoQuery = this.mongoQuery.sort(sortBy);
    } else {
      this.mongoQuery = this.mongoQuery.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    if (this.reqQuery.fields) {
      const fields = this.reqQuery.fields.split(",").join(" ");
      this.mongoQuery = this.mongoQuery.select(fields);
    } else {
      this.mongoQuery = this.mongoQuery.select("-__v");
    }
    return this;
  }

  search(modelName) {
    if (this.reqQuery.keyword) {
      let query = {};
      if (modelName === "Products") {
        query.$or = [
          { title: { $regex: this.reqQuery.keyword, $options: "i" } },
          { description: { $regex: this.reqQuery.keyword, $options: "i" } },
        ];
      } else {
        query = { name: { $regex: this.reqQuery.keyword, $options: "i" } };
      }

      this.mongoQuery = this.mongoQuery.find(query);
    }
    return this;
  }

  paginate(countDocuments) {
    const page = parseInt(this.reqQuery.page) || 1;
    const limit = parseInt(this.reqQuery.limit) || 12;
    const skip = (page - 1) * limit;
    let paginationResult = {};
    paginationResult.limit = limit;
    paginationResult.currentPage = page;
    paginationResult.totalPages = Math.ceil(countDocuments / limit) || 1;
    paginationResult.totalDocuments = countDocuments;
    this.paginationResult = paginationResult;

    this.mongoQuery = this.mongoQuery.skip(skip).limit(limit);
    return this;
  }
}

module.exports = ApiFeatures;
