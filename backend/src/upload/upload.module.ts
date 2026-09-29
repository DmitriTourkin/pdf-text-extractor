import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from './file.entity';
import { PageEntity } from 'src/pdf/page.entity';
import { PdfModule } from 'src/pdf/pdf.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity, PageEntity]),
    PdfModule,
    NotificationsModule,
],
  controllers: [UploadController],
  providers: [UploadService]
})
export class UploadModule {}
