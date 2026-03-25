import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { MqttService } from '../shared/mqtt.service';
import { SseGatewayService } from '../shared/sse-gateway.service';
import { PrinterRepository } from '../repositories';
import { PrinterRegisterService } from '../printer_register/printer_register.service';
import { PrinterService } from './printer.service';
import { AppLogger } from '../shared/logger';

const scopedLog = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

describe('PrinterService', () => {
  let service: PrinterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrinterService,
        {
          provide: AppLogger,
          useValue: { forContext: () => scopedLog },
        },
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
