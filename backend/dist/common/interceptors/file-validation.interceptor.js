"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileValidationInterceptor = void 0;
const common_1 = require("@nestjs/common");
let FileValidationInterceptor = class FileValidationInterceptor {
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const file = request.file;
        if (file) {
            this.validateFile(file);
        }
        else if (request.files && Array.isArray(request.files)) {
            request.files.forEach((f) => this.validateFile(f));
        }
        return next.handle();
    }
    validateFile(file) {
        const allowedMimeTypes = [
            'image/jpeg', 'image/png', 'image/webp',
            'application/pdf',
            'application/zip', 'application/x-zip-compressed'
        ];
        const MAX_SIZE_MB = 10;
        const maxSize = MAX_SIZE_MB * 1024 * 1024;
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`File type ${file.mimetype} is not allowed. Only JPEG, PNG, WEBP, PDF, and ZIP are permitted.`);
        }
        if (file.size > maxSize) {
            throw new common_1.BadRequestException(`File size exceeds the limit of ${MAX_SIZE_MB}MB.`);
        }
    }
};
exports.FileValidationInterceptor = FileValidationInterceptor;
exports.FileValidationInterceptor = FileValidationInterceptor = __decorate([
    (0, common_1.Injectable)()
], FileValidationInterceptor);
//# sourceMappingURL=file-validation.interceptor.js.map