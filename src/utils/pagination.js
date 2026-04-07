const pagination = async (model, reqQuery, options = {}) => {
  let { page, limit, sort, search, ...filters } = reqQuery;

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const skip = (page - 1) * limit;

  const query = {};

  // 🔎 Search
  if (search && options.searchFields) {
    query.$or = options.searchFields.map(field => ({
      [field]: { $regex: search, $options: 'i' }
    }));
  }

  // 🎯 Filters
  Object.keys(filters).forEach(key => {
    query[key] = filters[key];
  });

  // 🔃 Sorting
  let sortOption = { createdAt: -1 };
  if (sort) {
    sortOption = {};
    sort.split(',').forEach(field => {
      if (field.startsWith('-')) {
        sortOption[field.substring(1)] = -1;
      } else {
        sortOption[field] = 1;
      }
    });
  }

  let dataQuery = model.find(query).skip(skip).limit(limit).sort(sortOption);

  // populate support
  if (options.populate) {
    options.populate.forEach(p => {
      dataQuery = dataQuery.populate(p);
    });
  }

  const data = await dataQuery;
  const total = await model.countDocuments(query);

  return {
    data,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit
    }
  };
};

export default pagination;