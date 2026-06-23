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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentSearchDto = exports.AddCertificationDto = exports.AddSkillDto = exports.UpdateStudentProfileDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class UpdateStudentProfileDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { bio: { required: false, type: () => String }, location: { required: false, type: () => String }, githubUrl: { required: false, type: () => String }, linkedinUrl: { required: false, type: () => String }, twitterUrl: { required: false, type: () => String }, portfolioUrl: { required: false, type: () => String }, yearOfStudy: { required: false, type: () => Number, minimum: 1, maximum: 6 }, major: { required: false, type: () => String } };
    }
}
exports.UpdateStudentProfileDto = UpdateStudentProfileDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateStudentProfileDto.prototype, "bio", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateStudentProfileDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateStudentProfileDto.prototype, "githubUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateStudentProfileDto.prototype, "linkedinUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateStudentProfileDto.prototype, "twitterUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], UpdateStudentProfileDto.prototype, "portfolioUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(6),
    __metadata("design:type", Number)
], UpdateStudentProfileDto.prototype, "yearOfStudy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateStudentProfileDto.prototype, "major", void 0);
class AddSkillDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { skillId: { required: false, type: () => String }, skillName: { required: false, type: () => String }, level: { required: true, type: () => String } };
    }
}
exports.AddSkillDto = AddSkillDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddSkillDto.prototype, "skillId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddSkillDto.prototype, "skillName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddSkillDto.prototype, "level", void 0);
class AddCertificationDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { name: { required: true, type: () => String }, issuer: { required: true, type: () => String }, issueDate: { required: true, type: () => String }, credentialUrl: { required: false, type: () => String } };
    }
}
exports.AddCertificationDto = AddCertificationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddCertificationDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddCertificationDto.prototype, "issuer", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddCertificationDto.prototype, "issueDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], AddCertificationDto.prototype, "credentialUrl", void 0);
class StudentSearchDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { skills: { required: false, type: () => [String] }, collegeId: { required: false, type: () => String }, minReputation: { required: false, type: () => Number }, page: { required: false, type: () => Number, default: 1 }, limit: { required: false, type: () => Number, default: 20 } };
    }
}
exports.StudentSearchDto = StudentSearchDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], StudentSearchDto.prototype, "skills", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StudentSearchDto.prototype, "collegeId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StudentSearchDto.prototype, "minReputation", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StudentSearchDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StudentSearchDto.prototype, "limit", void 0);
//# sourceMappingURL=student.dto.js.map