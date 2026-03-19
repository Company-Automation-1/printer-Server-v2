import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { MqttService } from '../shared/mqtt.service';
import { SseGatewayService } from '../shared/sse-gateway.service';
import { PrinterRepository } from '../repositories';
import { PrinterRegisterService } from '../printer_register/printer_register.service';
import { PrinterService } from './printer.service';

describe('PrinterService', () => {
  let service: PrinterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrinterService,
        {
          provide: MqttService,
          useValue: {
            publish: jest.fn(),
            subscribe: jest.fn(),
            on: jest.fn(),
            once: jest.fn(),
            connected: false,
          },
        },
        { provide: SseGatewayService, useValue: {} },
        { provide: PrinterRepository, useValue: {} },
        { provide: PrinterRegisterService, useValue: {} },
        {
          provide: CACHE_MANAGER,
          useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<PrinterService>(PrinterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
