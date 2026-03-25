import { Module, Global } from '@nestjs/common';
import { StorageConfig, StorageType } from './storage.config';
import type { Storage } from './storage';
import { StorageService } from './storage.service';
import { LocalStorage } from './local.storage';
import { MinioStorage } from './minio.storage';
import { TosStorage } from './tos.storage';
import { StorageConfigModule } from '../../config/storage.module';
import { STORAGE } from './storage.tokens';
import { AppLogger } from '../logger';

/**
 * 全局存储模块
 *
 * 主要职责：
 * 1. 注入 STORAGE_CONFIG 配置项
 * 2. 根据 config.type 创建对应的 Storage 实现
 * 3. 提供统一的 StorageService 服务
 */
@Global()
@Module({
  imports: [StorageConfigModule],
  providers: [
    {
      provide: STORAGE,
      useFactory: (config: StorageConfig, appLogger: AppLogger): Storage => {
        appLogger
          .forContext('StorageModule')
          .log(`Initializing storage: ${config.type}`);

        switch (config.type) {
          case StorageType.LOCAL:
            return new LocalStorage(config, appLogger);
          case StorageType.MINIO:
            return new MinioStorage(config, appLogger);
          case StorageType.TOS:
            return new TosStorage(config, appLogger);
          case StorageType.OSS:
          case StorageType.S3:
            throw new Error(
              `Storage type ${config.type} is not implemented yet`,
            );
          default:
            throw new Error(`Unknown storage type: ${config.type as string}`);
        }
      },
      inject: ['STORAGE_CONFIG', AppLogger],
    },
    StorageService,
  ],
  exports: [StorageService],
})
export class StorageModule {}
