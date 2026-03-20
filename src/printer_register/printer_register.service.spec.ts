import { Test, TestingModule } from '@nestjs/testing';
import { PrinterRegisterService } from './printer_register.service';
import { StorageService } from '../shared/storage';
import { MqttService } from '../shared/mqtt.service';
import { PrinterRegisterRepository } from '../repositories/printer-register.repository';
import { APP_CONFIG } from '../config/app.module';

describe('PrinterRegisterService', () => {
  let service: PrinterRegisterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrinterRegisterService,
        {
          provide: APP_CONFIG,
          useValue: { httpProtocol: 'http', domain: 'localhost', port: 3000 },
        },
        { provide: StorageService, useValue: {} },
        { provide: MqttService, useValue: { publish: () => {} } },
        { provide: PrinterRegisterRepository, useValue: {} },
      ],
    }).compile();

    service = module.get<PrinterRegisterService>(PrinterRegisterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
