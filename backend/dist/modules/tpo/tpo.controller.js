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
exports.TpoController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tpo_service_1 = require("./tpo.service");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let TpoController = class TpoController {
    constructor(tpoService) {
        this.tpoService = tpoService;
    }
    getCollegeStudents(user, page = 1, limit = 20) {
        return this.tpoService.getCollegeStudents(user.sub, Number(page), Number(limit));
    }
    getCollegeAnalyticsSummary(user) {
        return this.tpoService.getCollegeAnalyticsSummary(user.sub);
    }
    getPendingVerifications(user) {
        return this.tpoService.getPendingVerifications(user.sub);
    }
    verifyStudent(studentId, user) {
        return this.tpoService.verifyStudent(user.sub, studentId);
    }
    rejectStudent(studentId, user, reason) {
        return this.tpoService.rejectStudent(user.sub, studentId, reason);
    }
    generateReport(user) {
        return this.tpoService.generateReport(user.sub);
    }
};
exports.TpoController = TpoController;
__decorate([
    (0, common_1.Get)('students'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all students in college [TPO]' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], TpoController.prototype, "getCollegeStudents", null);
__decorate([
    (0, common_1.Get)('analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get college analytics summary [TPO]' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TpoController.prototype, "getCollegeAnalyticsSummary", null);
__decorate([
    (0, common_1.Get)('verifications/pending'),
    (0, swagger_1.ApiOperation)({ summary: 'Get pending student verifications [TPO]' }),
    openapi.ApiResponse({ status: 200, type: [Object] }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TpoController.prototype, "getPendingVerifications", null);
__decorate([
    (0, common_1.Patch)('verify/:studentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve student verification' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TpoController.prototype, "verifyStudent", null);
__decorate([
    (0, common_1.Patch)('reject/:studentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject student verification' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], TpoController.prototype, "rejectStudent", null);
__decorate([
    (0, common_1.Get)('report'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate college report data [TPO]' }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TpoController.prototype, "generateReport", null);
exports.TpoController = TpoController = __decorate([
    (0, swagger_1.ApiTags)('tpo'),
    (0, swagger_1.ApiBearerAuth)('JWT'),
    (0, common_1.Controller)('tpo'),
    (0, roles_decorator_1.Roles)(client_1.Role.TPO),
    __metadata("design:paramtypes", [tpo_service_1.TpoService])
], TpoController);
//# sourceMappingURL=tpo.controller.js.map