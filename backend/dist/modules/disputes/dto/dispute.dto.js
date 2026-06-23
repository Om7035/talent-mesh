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
exports.ResolveDisputeDto = exports.DisputeOutcome = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var DisputeOutcome;
(function (DisputeOutcome) {
    DisputeOutcome["RELEASE"] = "RELEASE";
    DisputeOutcome["REFUND"] = "REFUND";
    DisputeOutcome["SPLIT"] = "SPLIT";
})(DisputeOutcome || (exports.DisputeOutcome = DisputeOutcome = {}));
class ResolveDisputeDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { resolution: { required: true, type: () => String }, outcome: { required: true, enum: require("./dispute.dto").DisputeOutcome } };
    }
}
exports.ResolveDisputeDto = ResolveDisputeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Admin resolution notes explaining the decision',
        example: 'After reviewing evidence, the work was substantially complete.',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ResolveDisputeDto.prototype, "resolution", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Outcome of the dispute resolution',
        enum: DisputeOutcome,
        example: DisputeOutcome.RELEASE,
    }),
    (0, class_validator_1.IsEnum)(DisputeOutcome),
    __metadata("design:type", String)
], ResolveDisputeDto.prototype, "outcome", void 0);
//# sourceMappingURL=dispute.dto.js.map