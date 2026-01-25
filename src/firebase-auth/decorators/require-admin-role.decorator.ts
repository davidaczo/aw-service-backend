import { SetMetadata } from '@nestjs/common';

export const RequireAdminRole = () => SetMetadata('requireAdminRole', true);
