import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, Param } from '@nestjs/common';
import 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('upload')
@ApiBearerAuth('JWT')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post(':folder')
  @ApiOperation({ summary: 'Upload a file (e.g., avatar, resume, deliverable)' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Param('folder') folder: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    
    // Ensure the folder is one of the allowed categories
    const allowedFolders = ['avatars', 'resumes', 'deliverables', 'disputes'];
    if (!allowedFolders.includes(folder)) {
      throw new BadRequestException('Invalid upload category');
    }

    const url = await this.uploadService.uploadFile(file, `talentmesh/${folder}`);
    return { url };
  }
}
