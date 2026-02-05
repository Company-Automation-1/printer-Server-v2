import { Logger } from '@nestjs/common';
import * as Minio from 'minio';
import { randomUUID } from 'crypto';
import type { Storage } from './storage';
import type { StorageConfig } from './storage.config';

function parseEndpoint(endpoint: string): { host: string; port: number } {
  const colon = endpoint.lastIndexOf(':');
  if (colon > 0) {
    const host = endpoint.slice(0, colon);
    const port = +endpoint.slice(colon + 1) || 9000;
    return { host, port };
  }
  return { host: endpoint, port: 9000 };
}

export class MinioStorage implements Storage {
  private readonly logger = new Logger(MinioStorage.name);
  private readonly client: Minio.Client;
  private readonly bucket: string;

  constructor(private readonly config: StorageConfig) {
    const { accessKey, secretKey, endpoint, ssl } = config;
    if (!accessKey || !secretKey || !endpoint) {
      throw new Error('MinIO requires accessKey, secretKey and endpoint');
    }
    const { host, port } = parseEndpoint(endpoint);
    this.client = new Minio.Client({
      endPoint: host,
      port,
      useSSL: ssl ?? false,
      accessKey,
      secretKey,
    });
    this.bucket = config.bucket;
  }

  private getExt(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot > 0 ? filename.substring(lastDot) : '';
  }

  async upload(file: Express.Multer.File, directory: string): Promise<string> {
    const ext = this.getExt(file.originalname);
    const filename = `${randomUUID()}${ext}`;
    const objectName = `${directory}/${filename}`;

    await this.client.putObject(
      this.bucket,
      objectName,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype },
    );
    this.logger.log(`File uploaded: ${objectName}`);
    return objectName;
  }

  async delete(key: string): Promise<void> {
    await this.client.removeObject(this.bucket, key);
    this.logger.log(`File deleted: ${key}`);
  }

  getUrl(key: string): string {
    const baseUrl = this.config.baseUrl.replace(/\/$/, '');
    const cleanKey = key.replace(/^\//, '');
    return `${baseUrl}/${cleanKey}`;
  }
}
