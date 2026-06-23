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
exports.FileDisputeDto = exports.ApproveDeliverableDto = exports.SubmitDeliverableDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class SubmitDeliverableDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { submission: { required: true, type: () => String }, notes: { required: false, type: () => String } };
    }
}
exports.SubmitDeliverableDto = SubmitDeliverableDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Deliverable content (rich text or URL to submitted work)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitDeliverableDto.prototype, "submission", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional notes for the client' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SubmitDeliverableDto.prototype, "notes", void 0);
class ApproveDeliverableDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { feedback: { required: false, type: () => String } };
    }
}
exports.ApproveDeliverableDto = ApproveDeliverableDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Feedback for the student on their submission' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApproveDeliverableDto.prototype, "feedback", void 0);
class FileDisputeDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { reason: { required: true, type: () => String }, evidence: { required: false, type: () => String } };
    }
}
exports.FileDisputeDto = FileDisputeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reason for filing the dispute' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FileDisputeDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Evidence (URL or descriptive text)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FileDisputeDto.prototype, "evidence", void 0);
//# sourceMappingURL=contract.dto.js.map