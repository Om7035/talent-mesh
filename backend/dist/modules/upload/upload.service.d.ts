import { ConfigService } from '@nestjs/config';
import 'multer';
export declare class UploadService {
    private readonly configService;
    constructor(configService: ConfigService);
    uploadFile(file: Express.Multer.File, folder: string): Promise<string>;
}
