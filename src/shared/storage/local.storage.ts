import { Logger } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { promises as fs } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import type { Storage } from './storage';
import type { StorageConfig } from './storage.config';

/**
 * 本地存储实现类
 */
export class LocalStorage implements Storage {
  private readonly logger = new Logger(LocalStorage.name);
  private readonly rootPath: string;

  /**
   * 构造函数
   * @param config - 存储配置
   */
  constructor(private readonly config: StorageConfig) {
    this.rootPath = config.bucket; // 根目录为存储桶名
    this.ensureRootDirectoryExists();
  }

  /**
   * 确保根目录存在
   */
  private ensureRootDirectoryExists(): void {
    if (!existsSync(this.rootPath)) {
      mkdirSync(this.rootPath, { recursive: true });
    }
  }

  /**
   * 确保目录存在
   * @param dirPath - 目录路径
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * 获取文件扩展名
   * @param filename - 文件名
   * @returns 文件扩展名
   */
  private getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.'); // 文件扩展名为文件名中的最后一个点后的部分
    return lastDot > 0 ? filename.substring(lastDot) : ''; // 如果文件名中包含点，则返回点后的部分，否则返回空字符串
  }

  async upload(file: Express.Multer.File, directory: string): Promise<string> {
    const ext = this.getFileExtension(file.originalname); // 文件扩展名为文件名中的最后一个点后的部分
    const filename = `${randomUUID()}${ext}`; // 文件名为主键 + 文件扩展名
    const dirPath = join(this.rootPath, directory); // 目录路径为根目录 + 目录
    const filePath = join(dirPath, filename); // 文件路径为目录路径 + 文件名

    await this.ensureDirectoryExists(dirPath);
    await fs.writeFile(filePath, file.buffer);

    const key = `${directory}/${filename}`;
    this.logger.log(`File uploaded: ${key}`);
    return key;
  }

  async delete(key: string): Promise<void> {
    const filePath = join(this.rootPath, key);
    try {
      await fs.unlink(filePath);
      this.logger.log(`File deleted: ${key}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  getUrl(key: string): string {
    const baseUrl = this.config.baseUrl.replace(/\/$/, '');
    const cleanKey = key.replace(/^\//, '');
    return `${baseUrl}/${cleanKey}`;
  }
}
