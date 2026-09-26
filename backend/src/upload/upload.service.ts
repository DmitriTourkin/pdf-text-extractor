import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { FileEntity, FileStatus } from './file.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/auth/user.entity';
import { PageEntity } from 'src/pdf/page.entity';
import { PdfService } from 'src/pdf/pdf.service';

@Injectable()
export class UploadService {
  private readonly bucket: string;
  private readonly s3: S3Client;

  constructor(
    private readonly configService: ConfigService,
    private readonly pdfService: PdfService,
    @InjectRepository(FileEntity)
    private readonly filesRepository: Repository<FileEntity>,
    @InjectRepository(PageEntity)
    private readonly pagesRepository: Repository<PageEntity>,
  ) {
    this.bucket = this.configService.getOrThrow<string>('MINIO_BUCKET');

    this.s3 = new S3Client({
      endpoint: this.configService.getOrThrow<string>('MINIO_ENDPOINT'),
      region: 'eu-central-1',
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('MINIO_ACCESS_KEY'),
        secretAccessKey:
          this.configService.getOrThrow<string>('MINIO_SECRET_KEY'),
      },
      forcePathStyle: true,
    });
  }

  async uploadFile(file: Express.Multer.File, userId: string): Promise<FileEntity> {
    const key = `${randomUUID()}-${file.originalname}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    let fileRecord: FileEntity;

    try {
      fileRecord = this.filesRepository.create({
        originalName: file.originalname,
        s3Key: key,
        size: file.size,
        mimeType: file.mimetype,
        status: FileStatus.DONE,
        user: { id: userId } as UserEntity
      });
      fileRecord = await this.filesRepository.save(fileRecord);
    } catch (e) {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      throw e;
    }

    try {
      const pageTexts = await this.pdfService.extractPages(file.buffer);
      
      const pages = pageTexts.map((txt, idx) => {
        return this.pagesRepository.create({
          pageNumber: idx + 1,
          textContent: txt,
          file: fileRecord
        })
      });
      await this.pagesRepository.save(pages);
      fileRecord.status = FileStatus.DONE;
    } catch (e) {
      fileRecord.status = FileStatus.ERROR;
    }
    return this.filesRepository.save(fileRecord);
  }
}
