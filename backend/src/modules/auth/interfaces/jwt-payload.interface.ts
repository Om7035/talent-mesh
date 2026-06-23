import { Role } from '@prisma/client';

/**
 * JWT Payload — the data encoded in access tokens.
 * Kept minimal to reduce token size.
 */
export interface JwtPayload {
  /** User UUID */
  sub: string;
  /** User email */
  email: string;
  /** User role */
  role: Role;
  /** User display name */
  name: string;
  /** Issued at (Unix timestamp) */
  iat?: number;
  /** Expiry (Unix timestamp) */
  exp?: number;
}
