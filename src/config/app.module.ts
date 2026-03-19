import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

export interface AppConfig {
  nodeEnv: string;
  httpProtocol: string;
  domain: string;
  port: number;
  apiKey: string;
  corsOrigin: string;
  corsMethods: string;
  corsCredentials: boolean;
}

export const APP_CONFIG = 'APP_CONFIG';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: APP_CONFIG,
      useFactory: (config: ConfigService): AppConfig => ({
        nodeEnv: config.get<string>('NODE_ENV') ?? 'prod',
        httpProtocol: config.get<string>('HTTP_PROTOCOL') ?? 'http',
        domain: config.get<string>('DOMAIN') ?? 'localhost',
        port: +(config.get<number>('PORT') ?? 3000),
        apiKey: config.get<string>('API_KEY') ?? '',
        corsOrigin: config.get<string>('CORS_ORIGIN') ?? '*',
        corsMethods:
          config.get<string>('CORS_METHODS') ??
          'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        corsCredentials: config.get<string>('CORS_CREDENTIALS') === 'true',
      }),
      inject: [ConfigService],
    },
  ],
  exports: [APP_CONFIG],
})
export class AppConfigModule {}
