import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { SignupDto, LoginDto } from './dto/auth.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
    avatarUrl: string | null;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly BCRYPT_ROUNDS: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.BCRYPT_ROUNDS = this.configService.get<number>('BCRYPT_ROUNDS', 12);
  }

  // ─────────────────────────────────────────────────────────────────
  // SIGNUP
  // ─────────────────────────────────────────────────────────────────

  async signup(dto: SignupDto): Promise<AuthTokens> {
    // Check for existing user
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists.');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, this.BCRYPT_ROUNDS);

    // Auto-verify college based on email domain if feature enabled
    let verificationStatus: 'PENDING' | 'VERIFIED' = 'PENDING';
    if (
      dto.role === Role.STUDENT &&
      dto.collegeId &&
      this.configService.get<boolean>('AUTO_VERIFY_COLLEGE_DOMAIN', true)
    ) {
      verificationStatus = await this.checkEmailDomainVerification(dto.email, dto.collegeId);
    }

    // Create user + role profile in a single transaction
    const user = await this.prisma.$transaction(
      async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email: dto.email,
            passwordHash,
            name: dto.name,
            role: dto.role,
          },
        });

        // Create Wallet for all users
        await tx.wallet.create({ data: { userId: newUser.id } });

        // Create role-specific profile
        if (dto.role === Role.STUDENT) {
          let collegeId = dto.collegeId;
          if (!collegeId) {
            throw new BadRequestException('College ID is required for student registration.');
          }
          await tx.student.create({
            data: {
              userId: newUser.id,
              collegeId: collegeId,
              departmentId: dto.departmentId ?? null,
              yearOfStudy: dto.yearOfStudy ?? null,
              verificationStatus,
            },
          });
        } else if (dto.role === Role.CLIENT) {
          await tx.client.create({
            data: {
              userId: newUser.id,
              companyName: dto.companyName ?? null,
              industry: dto.industry ?? null,
            },
          });
        } else if (dto.role === Role.RECRUITER) {
          await tx.recruiter.create({
            data: {
              userId: newUser.id,
              companyName: dto.companyName ?? 'Independent Recruiter',
              industry: dto.industry ?? null,
            },
          });
        }

        this.logger.log(`New ${dto.role} registered: ${dto.email}`);
        return newUser;
      },
      {
        maxWait: 20000, // wait up to 20 seconds to acquire connection
        timeout: 45000, // allow up to 45 seconds for transaction execution
      },
    );

    return this.generateTokens(user);
  }

  // ─────────────────────────────────────────────────────────────────
  // LOGIN
  // ─────────────────────────────────────────────────────────────────

  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        passwordHash: true,
        isActive: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      // Constant time response to prevent user enumeration
      await bcrypt.compare(dto.password, '$2b$12$placeholder.hash.to.prevent.timing');
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Your account has been deactivated. Please contact support.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    // Update last login timestamp
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    this.logger.log(`User logged in: ${user.email} [${user.role}]`);
    return this.generateTokens(user);
  }

  // ─────────────────────────────────────────────────────────────────
  // REFRESH TOKENS
  // ─────────────────────────────────────────────────────────────────

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    // Verify the refresh token matches what's stored (token rotation security)
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, role: true, refreshToken: true, isActive: true, avatarUrl: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or deactivated.');
    }

    // Validate stored refresh token (prevents replay attacks after logout)
    const isTokenValid = user.refreshToken && await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isTokenValid) {
      throw new UnauthorizedException('Refresh token reuse detected. Please log in again.');
    }

    return this.generateTokens(user);
  }

  // ─────────────────────────────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────────────────────────────

  async logout(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    this.logger.log(`User logged out: ${userId}`);
  }

  // ─────────────────────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ─────────────────────────────────────────────────────────────────

  private async generateTokens(user: {
    id: string;
    email: string;
    name: string;
    role: Role;
    avatarUrl?: string | null;
  }): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRY', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRY', '7d'),
      }),
    ]);

    // Store hashed refresh token for rotation validation
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl ?? null,
      },
    };
  }

  /**
   * Email domain verification logic:
   * Checks if the student's email domain matches the registered college domain.
   * Falls back to PENDING if no college domain is configured.
   */
  private async checkEmailDomainVerification(
    email: string,
    collegeId: string,
  ): Promise<'PENDING' | 'VERIFIED'> {
    try {
      const college = await this.prisma.college.findUnique({
        where: { id: collegeId },
        select: { domain: true },
      });

      if (!college?.domain) return 'PENDING';

      const emailDomain = email.split('@')[1]?.toLowerCase();
      const collegeDomain = college.domain.toLowerCase();

      if (emailDomain === collegeDomain) {
        this.logger.log(`Email domain auto-verification: ${email} matches ${collegeDomain}`);
        return 'VERIFIED';
      }
    } catch (err) {
      this.logger.warn(`Domain verification failed for ${email}: ${err}`);
    }
    return 'PENDING';
  }
}
