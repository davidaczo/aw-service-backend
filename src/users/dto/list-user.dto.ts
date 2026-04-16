import { UserRole } from '../enum/user-role.enum';
import { PaginatedList } from '../../dto/paginated-list.dto';

export class ListUserDto {
  id: string;
  name: string;
  email: string;
  photoUrl: string;
  role: UserRole;

  constructor(data: {
    id: string;
    name: string;
    email: string;
    photoUrl: string;
    role: UserRole;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.photoUrl = data.photoUrl;
    this.email = data.email;
    this.role = data.role;
  }
}

export class PaginatedListUserDto extends PaginatedList<ListUserDto> {
  items: ListUserDto[];
  meta: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };

  constructor(
    items: ListUserDto[],
    meta: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    },
  ) {
    super();
    this.items = items;
    this.meta = meta;
  }
}
