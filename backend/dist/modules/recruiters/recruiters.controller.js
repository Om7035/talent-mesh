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
exports.RecruitersController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const recruiters_service_1 = require("./recruiters.service");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let RecruitersController = class RecruitersController {
    constructor(recruitersService) {
        this.recruitersService = recruitersService;
    }
    discoverTalent(query) {
        return this.recruitersService.discoverTalent(query);
    }
    shortlistStudent(user, studentId) {
        return this.recruitersService.shortlistStudent(user.sub, studentId);
    }
    getAnalytics(user) {
        return this.recruitersService.getAnalytics(user.sub);
    }
};
exports.RecruitersController = RecruitersController;
__decorate([
    (0, common_1.Get)('discover'),
    (0, swagger_1.ApiOperation)({ summary: 'Discover verified talent' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RecruitersController.prototype, "discoverTalent", null);
__decorate([
    (0, common_1.Post)('shortlist/:studentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Shortlist a student' }),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('studentId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], RecruitersController.prototype, "shortlistStudent", null);
__decorate([
    (0, common_1.Get)('analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get recruitment analytics' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RecruitersController.prototype, "getAnalytics", null);
exports.RecruitersController = RecruitersController = __decorate([
    (0, swagger_1.ApiTags)('recruiters'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.Controller)('recruiters'),
    (0, roles_decorator_1.Roles)(client_1.Role.RECRUITER),
    __metadata("design:paramtypes", [recruiters_service_1.RecruitersService])
], RecruitersController);
//# sourceMappingURL=recruiters.controller.js.map