import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StorageConfig, StorageType } from '../shared/storage/storage.config';

/**
 * 存储配置模块
 * 职责：从环境变量读取配置，提供 STORAGE_CONFIG
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'STORAGE_CONFIG',
      useFactory: (configService: ConfigService): StorageConfig => {
        return {
          type: configService.get<StorageType>('STORAGE_TYPE')!,
          bucket: configService.get<string>('STORAGE_BUCKET')!,
          baseUrl: configService.get<string>('STORAGE_BASE_URL')!,
          accessKey: configService.get<string>('STORAGE_ACCESS_KEY'),
          secretKey: configService.get<string>('STORAGE_SECRET_KEY'),
          endpoint: configService.get<string>('STORAGE_ENDPOINT'),
          ssl: configService.get<boolean>('STORAGE_SSL'),
          region: configService.get<string>('STORAGE_REGION'),
        };
      },
      inject: [ConfigService],
    },
  ],
  exports: ['STORAGE_CONFIG'],
})
export class StorageConfigModule {}
