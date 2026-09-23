import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const key = await this.uploadService.uploadFile(file);

    return {
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      s3Key: key,
    };
  }
}
