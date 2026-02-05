import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

const env = ['dev', 'test', 'prod'];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const nodeEnv = config.get<string>('NODE_ENV') ?? 'dev';
        const effectiveEnv = env.includes(nodeEnv) ? nodeEnv : 'dev';
        const username = config.get<string>('DB_USERNAME');
        return {
          type: 'mongodb',
          host: config.get<string>('DB_HOST')!,
          port: config.get<number>('DB_PORT')!,
          username,
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_DATABASE'),
          ...(username && { authSource: 'admin' }), // 用户创建在 admin，认证库需指定
          synchronize: effectiveEnv === 'dev', // 开发环境时同步数据库结构
          logging: effectiveEnv === 'dev', // 开发环境时打印数据库日志
          autoLoadEntities: true,
        };
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DbConfigModule {}
