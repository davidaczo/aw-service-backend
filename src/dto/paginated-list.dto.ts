export abstract class PaginatedList<T> {
  meta: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
  items: T[];
}
