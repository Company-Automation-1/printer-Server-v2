import { Logger } from '@nestjs/common';
import { TosClient } from '@volcengine/tos-sdk';
import { randomUUID } from 'crypto';
import type { Storage } from './storage';
import type { StorageConfig } from './storage.config';

export class TosStorage implements Storage {
  private readonly logger = new Logger(TosStorage.name);
  private readonly client: TosClient;
  private readonly bucket: string;

  constructor(private readonly config: StorageConfig) {
    const { accessKey, secretKey, endpoint, region } = config;
    if (!accessKey || !secretKey || !endpoint || !region) {
      throw new Error('TOS requires accessKey, secretKey, endpoint and region');
    }
    this.client = new TosClient({
      accessKeyId: accessKey,
      accessKeySecret: secretKey,
      endpoint,
      region,
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

    await this.client.putObject({
      bucket: this.bucket,
      key: objectName,
      body: file.buffer,
      contentType: file.mimetype,
    });
    this.logger.log(`File uploaded: ${objectName}`);
    return objectName;
  }

  async delete(key: string): Promise<void> {
    await this.client.deleteObject({
      bucket: this.bucket,
      key,
    });
    this.logger.log(`File deleted: ${key}`);
  }

  getUrl(key: string): string {
    const baseUrl = this.config.baseUrl.replace(/\/$/, '');
    const cleanKey = key.replace(/^\//, '');
    return `${baseUrl}/${cleanKey}`;
  }
}
