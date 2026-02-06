/**
 * 存储类型枚举
 */
export enum StorageType {
  LOCAL = 'local',
  MINIO = 'minio',
  TOS = 'tos',
  OSS = 'oss',
  S3 = 's3',
}

/**
 * 存储配置接口
 */
export interface StorageConfig {
  /** 存储类型 */
  type: StorageType;
  /** 存储桶名/根目录 */
  bucket: string;
  /** 文件访问域名 */
  baseUrl: string;
  /** 访问密钥 (对象存储需要) */
  accessKey?: string;
  /** 秘密密钥 (对象存储需要) */
  secretKey?: string;
  /** 服务API地址 (对象存储需要) */
  endpoint?: string;
  /** 是否使用 SSL/TLS */
  ssl?: boolean;
  /** 服务区域 (S3 必需, OSS 可选) */
  region?: string;
}
