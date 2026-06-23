"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let PrismaService = PrismaService_1 = class PrismaService extends client_1.PrismaClient {
    constructor() {
        super({
            log: [
                { emit: 'event', level: 'query' },
                { emit: 'stdout', level: 'error' },
                { emit: 'stdout', level: 'warn' },
            ],
            errorFormat: 'colorless',
        });
        this.logger = new common_1.Logger(PrismaService_1.name);
    }
    async onModuleInit() {
        this.logger.log('Connecting to PostgreSQL via Prisma...');
        await this.$connect();
        this.logger.log('✅ Database connection established');
        if (process.env.NODE_ENV !== 'production') {
            this.$on('query', (e) => {
                if (e.duration > 500) {
                    this.logger.warn(`🐢 Slow Query (${e.duration}ms): ${e.query}`);
                }
            });
        }
    }
    async onModuleDestroy() {
        this.logger.log('Disconnecting from database...');
        await this.$disconnect();
    }
    async cleanDatabase() {
        if (process.env.NODE_ENV !== 'test') {
            throw new Error('cleanDatabase() can only be called in test environment!');
        }
        const deleteOrder = [
            'auditLog',
            'notification',
            'recommendation',
            'leaderboard',
            'dispute',
            'deliverable',
            'escrow',
            'review',
            'transaction',
            'wallet',
            'contract',
            'projectApplication',
            'projectSkill',
            'project',
            'studentSkill',
            'certification',
            'resume',
            'student',
            'client',
            'recruiter',
            'tpo',
            'admin',
            'department',
            'college',
            'user',
        ];
        for (const model of deleteOrder) {
            await this[model].deleteMany();
        }
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map