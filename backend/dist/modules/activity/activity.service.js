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
var ActivityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let ActivityService = ActivityService_1 = class ActivityService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ActivityService_1.name);
    }
    async logEvent(dto) {
        try {
            await this.prisma.auditLog.create({
                data: {
                    userId: dto.userId,
                    action: dto.action,
                    resource: dto.resource,
                    resourceId: dto.resourceId,
                    metadata: dto.metadata ?? {},
                    ipAddress: dto.ipAddress,
                    userAgent: dto.userAgent,
                },
            });
        }
        catch (error) {
            this.logger.error(`Failed to log activity event: ${dto.action}`, error);
        }
    }
};
exports.ActivityService = ActivityService;
exports.ActivityService = ActivityService = ActivityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ActivityService);
//# sourceMappingURL=activity.service.js.map