import { UserEntity } from 'src/auth/user.entity';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne
} from 'typeorm'

export enum FileStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  DONE = 'done',
  ERROR = 'error',
}

@Entity('files')
export class FileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originalName: string;

  @Column()
  s3Key: string;

  @Column()
  size: number;

  @Column()
  mimeType: string;

  @Column({
    type: 'enum',
    enum: FileStatus,
    default: FileStatus.PENDING
  })
  status: FileStatus

  @CreateDateColumn()
  uploadedAt: Date;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE'})
  user: UserEntity
}