class PaginationMetaDto implements Readonly<PaginationMetaDto> {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

class PaginationLinksDto implements Readonly<PaginationLinksDto> {
  previous: string;
  next: string;
  first: string;
  last: string;
}

export class PaginationResponseDto implements Readonly<PaginationResponseDto> {
  meta: PaginationMetaDto;
  links: PaginationLinksDto;
}
