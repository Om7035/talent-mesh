"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../database/prisma.service");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.logger = new common_1.Logger(AuthService_1.name);
        this.BCRYPT_ROUNDS = this.configService.get('BCRYPT_ROUNDS', 12);
    }
    async signup(dto) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing) {
            throw new common_1.ConflictException('An account with this email already exists.');
        }
        const passwordHash = await bcrypt.hash(dto.password, this.BCRYPT_ROUNDS);
        let verificationStatus = 'PENDING';
        if (dto.role === client_1.Role.STUDENT &&
            dto.collegeId &&
            this.configService.get('AUTO_VERIFY_COLLEGE_DOMAIN', true)) {
            verificationStatus = await this.checkEmailDomainVerification(dto.email, dto.collegeId);
        }
        const user = await this.prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    email: dto.email,
                    passwordHash,
                    name: dto.name,
                    role: dto.role,
                },
            });
            await tx.wallet.create({ data: { userId: newUser.id } });
            if (dto.role === client_1.Role.STUDENT) {
                let collegeId = dto.collegeId;
                if (!collegeId) {
                    throw new common_1.BadRequestException('College ID is required for student registration.');
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
            }
            else if (dto.role === client_1.Role.CLIENT) {
                await tx.client.create({
                    data: {
                        userId: newUser.id,
                        companyName: dto.companyName ?? null,
                        industry: dto.industry ?? null,
                    },
                });
            }
            else if (dto.role === client_1.Role.RECRUITER) {
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
        }, {
            maxWait: 20000,
            timeout: 45000,
        });
        return this.generateTokens(user);
    }
    async login(dto) {
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
            await bcrypt.compare(dto.password, '$2b$12$placeholder.hash.to.prevent.timing');
            throw new common_1.UnauthorizedException('Invalid email or password.');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Your account has been deactivated. Please contact support.');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid email or password.');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        this.logger.log(`User logged in: ${user.email} [${user.role}]`);
        return this.generateTokens(user);
    }
    async refreshTokens(refreshToken) {
        let payload;
        try {
            payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token.');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: { id: true, email: true, name: true, role: true, refreshToken: true, isActive: true, avatarUrl: true },
        });
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('User not found or deactivated.');
        }
        const isTokenValid = user.refreshToken && await bcrypt.compare(refreshToken, user.refreshToken);
        if (!isTokenValid) {
            throw new common_1.UnauthorizedException('Refresh token reuse detected. Please log in again.');
        }
        return this.generateTokens(user);
    }
    async logout(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken: null },
        });
        this.logger.log(`User logged out: ${userId}`);
    }
    async generateTokens(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_ACCESS_SECRET'),
                expiresIn: this.configService.get('JWT_ACCESS_EXPIRY', '15m'),
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get('JWT_REFRESH_EXPIRY', '7d'),
            }),
        ]);
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
    async checkEmailDomainVerification(email, collegeId) {
        try {
            const college = await this.prisma.college.findUnique({
                where: { id: collegeId },
                select: { domain: true },
            });
            if (!college?.domain)
                return 'PENDING';
            const emailDomain = email.split('@')[1]?.toLowerCase();
            const collegeDomain = college.domain.toLowerCase();
            if (emailDomain === collegeDomain) {
                this.logger.log(`Email domain auto-verification: ${email} matches ${collegeDomain}`);
                return 'VERIFIED';
            }
        }
        catch (err) {
            this.logger.warn(`Domain verification failed for ${email}: ${err}`);
        }
        return 'PENDING';
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map