import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * @Roles() decorator
 * Marks a route as accessible only to users with specified roles.
 * 
 * Usage:
 *   @Roles(Role.ADMIN, Role.TPO)
 *   @Get('sensitive-data')
 *   getSensitiveData() { ... }
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
