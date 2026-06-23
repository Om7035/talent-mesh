import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class FileValidationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const file = request.file;

    if (file) {
      this.validateFile(file);
    } else if (request.files && Array.isArray(request.files)) {
      request.files.forEach((f: any) => this.validateFile(f));
    }

    return next.handle();
  }

  private validateFile(file: any) {
    const allowedMimeTypes = [
      'image/jpeg', 'image/png', 'image/webp', // Images
      'application/pdf', // Resumes
      'application/zip', 'application/x-zip-compressed' // Deliverables
    ];
    
    const MAX_SIZE_MB = 10;
    const maxSize = MAX_SIZE_MB * 1024 * 1024;

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`File type ${file.mimetype} is not allowed. Only JPEG, PNG, WEBP, PDF, and ZIP are permitted.`);
    }

    if (file.size > maxSize) {
      throw new BadRequestException(`File size exceeds the limit of ${MAX_SIZE_MB}MB.`);
    }
  }
}
