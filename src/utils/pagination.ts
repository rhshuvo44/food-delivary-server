export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
  data: T[];
  meta: {
    currentPage: number;
    perPage: number;
    totalPages: number;
    totalItems: number;
  };
}

export function paginate<T>(items: T[], page = 1, limit = 20): PaginationResult<T> {
  const currentPage = Math.max(page, 1);
  const perPage = Math.max(limit, 1);
  const totalItems = items.length;
  const totalPages = Math.max(Math.ceil(totalItems / perPage), 1);
  const offset = (currentPage - 1) * perPage;

  return {
    data: items.slice(offset, offset + perPage),
    meta: {
      currentPage,
      perPage,
      totalPages,
      totalItems,
    },
  };
}
