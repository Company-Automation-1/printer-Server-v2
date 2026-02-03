import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { connect, MqttClient } from 'mqtt';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'MQTT_CLIENT',
      useFactory: (configService: ConfigService): MqttClient => {
        const brokerUrl = configService.get<string>('MQTT_BROKER_URL')!;
        const options = {
          clientId:
            configService.get<string>('MQTT_CLIENT_ID') ||
            `Server_${Date.now()}`,
          username: configService.get<string>('MQTT_USERNAME')!,
          password: configService.get<string>('MQTT_PASSWORD')!,
          clean: true,
          reconnectPeriod: 5000,
          connectTimeout: 10000,
        };

        return connect(brokerUrl, options);
      },
      inject: [ConfigService],
    },
  ],
  exports: ['MQTT_CLIENT'],
})
export class MqttModule {}
