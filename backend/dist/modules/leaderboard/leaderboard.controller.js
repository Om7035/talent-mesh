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
exports.LeaderboardController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const leaderboard_service_1 = require("./leaderboard.service");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../database/prisma.service");
const public_decorator_1 = require("../../common/decorators/public.decorator");
let LeaderboardController = class LeaderboardController {
    constructor(leaderboardService, prisma) {
        this.leaderboardService = leaderboardService;
        this.prisma = prisma;
    }
    getGlobal(page = 1, limit = 20) {
        return this.leaderboardService.getGlobalLeaderboard(page, limit);
    }
    getCollegeBoard(collegeId, page = 1, limit = 20) {
        return this.leaderboardService.getCollegeLeaderboard(collegeId, page, limit);
    }
    getSkillBoard() {
        return this.leaderboardService.getSkillLeaderboard();
    }
    async getMyRank(user) {
        const student = await this.prisma.student.findUnique({ where: { userId: user.sub } });
        if (!student)
            return null;
        return this.leaderboardService.getStudentRank(student.id);
    }
};
exports.LeaderboardController = LeaderboardController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('global'),
    (0, swagger_1.ApiOperation)({ summary: 'Global student leaderboard' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], LeaderboardController.prototype, "getGlobal", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('college/:collegeId'),
    (0, swagger_1.ApiOperation)({ summary: 'College-specific leaderboard' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('collegeId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], LeaderboardController.prototype, "getCollegeBoard", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('skills'),
    (0, swagger_1.ApiOperation)({ summary: 'Skill-based leaderboard showing top experts per skill' }),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LeaderboardController.prototype, "getSkillBoard", null);
__decorate([
    (0, common_1.Get)('my-rank'),
    (0, roles_decorator_1.Roles)(client_1.Role.STUDENT),
    (0, swagger_1.ApiOperation)({ summary: 'Get current student\'s rank across all dimensions [STUDENT]' }),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LeaderboardController.prototype, "getMyRank", null);
exports.LeaderboardController = LeaderboardController = __decorate([
    (0, swagger_1.ApiTags)('leaderboard'),
    (0, common_1.Controller)('leaderboard'),
    __metadata("design:paramtypes", [leaderboard_service_1.LeaderboardService,
        prisma_service_1.PrismaService])
], LeaderboardController);
//# sourceMappingURL=leaderboard.controller.js.map