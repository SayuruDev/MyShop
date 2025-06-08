class APIFilters {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    const keyword = this.queryStr.keyword
      ? {
          name: {
            $regex: this.queryStr.keyword,
            $options: "i",
          },
        }
      : {};

    this.query = this.query.find({ ...keyword });
    return this;
  }

  filters() {
    const queryCopy = { ...this.queryStr };

    

    // Fields to remove
    const fieldsToRemove = ["keyword", "page"];
    fieldsToRemove.forEach((el) => delete queryCopy[el]);

     // Convert operators like gte, gt, lt, lte
    Object.keys(queryCopy).forEach((key) => {
      if (key.includes("[")) {
        const [field, operator] = key.split("[");
        const mongoOperator = operator.replace("]", "");
        
        if (!queryCopy[field]) queryCopy[field] = {}; // Initialize if missing
        queryCopy[field][`$${mongoOperator}`] = Number(queryCopy[key]); // Convert to number
        delete queryCopy[key]; // Remove original key
      }
    });
    console.log("Parsed Query:", JSON.stringify(queryCopy, null, 2));

    this.query = this.query.find(queryCopy);
    return this;
  }
  pagination(resPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;
    const skip = resPerPage * (currentPage - 1);

    this.query = this.query.limit(resPerPage).skip(skip);
    return this;
  }
}

export default APIFilters;



    