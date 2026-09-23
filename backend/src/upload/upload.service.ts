import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { FileEntity, FileStatus } from './file.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UploadService {
  private readonly bucket: string;
  private readonly s3: S3Client;

  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(FileEntity)
    private readonly filesRepository: Repository<FileEntity>,
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

  async uploadFile(file: Express.Multer.File) {
    const key = `${randomUUID()}-${file.originalname}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    try {
      const fileRecord = this.filesRepository.create({
        originalName: file.originalname,
        s3Key: key,
        size: file.size,
        mimeType: file.mimetype,
        status: FileStatus.DONE,
      });

      return await this.filesRepository.save(fileRecord);
    } catch (e) {
      await this.s3.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      throw e;
    }
  }
}
