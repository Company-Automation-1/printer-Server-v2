import { Injectable, Inject } from '@nestjs/common';
import type { Storage } from './storage';
import { STORAGE } from './storage.tokens';

/**
 * 存储服务
 * 对外暴露的统一存储服务，内部委托给具体的存储实现
 */
@Injectable()
export class StorageService implements Storage {
  constructor(@Inject(STORAGE) private readonly storage: Storage) {}

  /**
   * 上传文件
   * @param file - Multer 文件对象
   * @param directory - 子目录（如 'avatars', 'tasks'）
   * @returns Object Key
   */
  async upload(file: Express.Multer.File, directory: string): Promise<string> {
    return this.storage.upload(file, directory);
  }

  /**
   * 删除文件
   * @param key - Object Key
   */
  async delete(key: string): Promise<void> {
    return this.storage.delete(key);
  }

  /**
   * 获取完整访问 URL
   * @param key - Object Key
   * @returns 完整的文件访问 URL
   */
  getUrl(key: string): string {
    return this.storage.getUrl(key);
  }
}
