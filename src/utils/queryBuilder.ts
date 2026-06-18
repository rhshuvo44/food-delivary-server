export const buildMongoQuery = (queryObj: any) => {
  const reqQuery = { ...queryObj };
  const excludeFields = ['page', 'sort', 'limit', 'fields', 'search'];
  excludeFields.forEach((el) => delete reqQuery[el]);

  // Advanced Filtering (gte, gt, lte, lt)
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  const parsedFilters = JSON.parse(queryStr);

  // Soft Delete Guarantee
  parsedFilters.isDeleted = false;

  // Pagination Setup
  const page = Math.max(Number(queryObj.page) || 1, 1);
  const limit = Math.max(Number(queryObj.limit) || 10, 1);
  const skip = (page - 1) * limit;

  // Sorting
  let sortBy: any = { createdAt: 'desc' };
  if (queryObj.sort) {
    const [field, order] = queryObj.sort.split(':');
    sortBy = { [field]: order === 'desc' ? 'desc' : 'asc' };
  }

  return { filter: parsedFilters, skip, limit, page, orderBy: sortBy };
};