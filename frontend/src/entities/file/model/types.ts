export type FileStatus = 'pending' | 'processing' | 'done' | 'error';

export interface FileDto {
  id: string;
  originalName: string;
  s3Key: string;
  size: number;
  mimeType: string;
  status: FileStatus;
  uploadedAt: string; 
}

