import { Test, TestingModule } from '@nestjs/testing';
import { PrinterRegisterController } from './printer_register.controller';
import { PrinterRegisterService } from './printer_register.service';
import { StorageService } from '../shared/storage';
import { PrinterRegisterRepository } from '../repositories/printer-register.repository';
import { ResponseService } from '../middlewares/response';
import { BaseService } from '../base/base.service';
import { APP_CONFIG } from '../config/app.module';
import { MqttService } from '../shared/mqtt.service';

describe('PrinterRegisterController', () => {
  let controller: PrinterRegisterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrinterRegisterController],
      providers: [
        PrinterRegisterService,
        {
          provide: APP_CONFIG,
          useValue: { httpProtocol: 'http', domain: 'localhost', port: 3000 },
        },
        { provide: StorageService, useValue: {} },
        { provide: MqttService, useValue: { publish: jest.fn() } },
        { provide: PrinterRegisterRepository, useValue: {} },
        { provide: ResponseService, useValue: {} },
        { provide: BaseService, useValue: {} },
      ],
    }).compile();

    controller = module.get<PrinterRegisterController>(
      PrinterRegisterController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
