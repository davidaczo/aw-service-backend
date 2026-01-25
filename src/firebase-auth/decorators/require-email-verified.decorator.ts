import { SetMetadata } from '@nestjs/common';

export const RequireVerifiedEmail = (required = true) =>
  SetMetadata('requireVerifiedEmail', required);
