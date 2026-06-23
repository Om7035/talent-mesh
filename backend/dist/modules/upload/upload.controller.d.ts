import 'multer';
import { UploadService } from './upload.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
export declare class UploadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    uploadFile(folder: string, file: Express.Multer.File, user: JwtPayload): Promise<{
        url: string;
    }>;
}
