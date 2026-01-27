/**
 * 存储服务接口
 */
export interface Storage {
  /**
   * 上传文件
   * @param file - Multer 文件对象
   * @param directory - 目录（如 'avatars', 'tasks'）
   * @returns Object Key
   */
  upload(file: Express.Multer.File, directory: string): Promise<string>;

  /**
   * 删除文件
   * @param key - Object Key
   */
  delete(key: string): Promise<void>;

  /**
   * 获取完整访问 URL
   * @param key - Object Key
   * @returns 完整的文件访问 URL
   */
  getUrl(key: string): string;
}
