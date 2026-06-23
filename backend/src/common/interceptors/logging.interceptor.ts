import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url } = request;
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - start;
          const statusCode = response.statusCode;
          const userId = (request as any).user?.sub || 'anonymous';
          this.logger.log(`[${method}] ${url} → ${statusCode} (${duration}ms) [user:${userId}]`);
        },
        error: (err) => {
          const duration = Date.now() - start;
          this.logger.error(`[${method}] ${url} → ERROR (${duration}ms): ${err.message}`);
        },
      }),
    );
  }
}
