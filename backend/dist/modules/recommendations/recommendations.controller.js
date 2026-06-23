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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const recommendation_engine_1 = require("./recommendation.engine");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../database/prisma.service");
let RecommendationsController = class RecommendationsController {
    constructor(recommendationEngine, prisma) {
        this.recommendationEngine = recommendationEngine;
        this.prisma = prisma;
    }
    async getForMe(user, limit = 10) {
        const student = await this.prisma.student.findUnique({ where: { userId: user.sub } });
        if (!student)
            return [];
        return this.recommendationEngine.getForStudent(student.id, limit);
    }
    getForProject(projectId, limit = 10) {
        return this.recommendationEngine.getForProject(projectId, limit);
    }
};
exports.RecommendationsController = RecommendationsController;
__decorate([
    (0, common_1.Get)('for-me'),
    (0, roles_decorator_1.Roles)(client_1.Role.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Get AI-recommended projects for current student [STUDENT]' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, example: 10 }),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RecommendationsController.prototype, "getForMe", null);
__decorate([
    (0, common_1.Get)('project/:projectId/candidates'),
    (0, roles_decorator_1.Roles)(client_1.Role.CLIENT, client_1.Role.RECRUITER, client_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get best-matched student candidates for a project [CLIENT/RECRUITER]' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, example: 10 }),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, common_1.Param)('projectId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RecommendationsController.prototype, "getForProject", null);
exports.RecommendationsController = RecommendationsController = __decorate([
    (0, swagger_1.ApiTags)('recommendations'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.Controller)('recommendations'),
    __metadata("design:paramtypes", [recommendation_engine_1.RecommendationEngine,
        prisma_service_1.PrismaService])
], RecommendationsController);
//# sourceMappingURL=recommendations.controller.js.map