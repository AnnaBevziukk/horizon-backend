export default class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    //2.ADVANCED FILTERING

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');

      if (sortBy === 'price_asc') {
        this.query = this.query.sort({ price: 1 }); // Сортування за ціною від найменшої до найбільшої
      } else if (sortBy === 'price_desc') {
        this.query = this.query.sort({ price: -1 }); // Сортування за ціною від найбільшої до найменшої
      } else if (sortBy === 'difficulty_asc') {
        this.query = this.query.sort({ difficulty: 1 }); // Сортування за складністю від легкої до складної
      } else if (sortBy === 'difficulty_desc') {
        this.query = this.query.sort({ difficulty: -1 }); // Сортування за складністю від складної до легкої
      }
    } else {
      this.query = this.query.sort('-createdAt'); // Якщо сортування не задано, сортуємо за датою створення за замовчуванням
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.sort({ _id: 1 }).skip(skip).limit(limit);
    return this;
  }
}
