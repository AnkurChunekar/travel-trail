const EXCLUDE_QUERY_PARAMS = ["limit", "sort", "page", "projection"];
const QUERY_OPERATORS_REGEX = /\b(gte|gt|lte|lt)\b/g;

class APIQueryFeatures {
  constructor(query, queryObj) {
    this.query = query;
    this.queryObj = queryObj;
  }

  sanitizeQueryObj() {
    let result = { ...this.queryObj };

    EXCLUDE_QUERY_PARAMS.forEach((item) => delete result[item]);

    // 1. QUERYING
    result = JSON.parse(
      JSON.stringify(result).replace(
        QUERY_OPERATORS_REGEX,
        (matched) => `$${matched}`
      )
    );

    this.query.find(result);
    return this;
  }

  sort() {
    if (this.queryObj.sort) {
      this.query.sort(this.queryObj.sort.replaceAll(",", " "));
    } else this.query.sort("-createdAt");
    return this;
  }

  project() {
    if (this.queryObj.projection) {
      this.query.select(this.queryObj.projection.split(","));
    }
    return this;
  }

  paginate() {
    // by default we will keep 100 as limit, why? think if there are million records then?
    let page = Number(this.queryObj.page) || 1;
    if (page < 1) page = 1;
    const limit = Math.abs(Number(this.queryObj.limit)) || 100;
    const skip = limit * (page - 1);

    this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIQueryFeatures;
