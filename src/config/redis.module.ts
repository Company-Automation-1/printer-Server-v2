import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import KeyvRedis from '@keyv/redis';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const host = config.get<string>('REDIS_HOST')!;
        const port = config.get<number>('REDIS_PORT')!;
        const password = config.get<string>('REDIS_PASSWORD');
        const db = config.get<number>('REDIS_DB') ?? 0;

        const url = password
          ? `redis://:${password}@${host}:${port}/${db}`
          : `redis://${host}:${port}/${db}`;

        return {
          stores: [new KeyvRedis(url)],
          ttl: 60_000,
        };
      },
    }),
  ],
  exports: [CacheModule],
})
export class RedisModule {}
