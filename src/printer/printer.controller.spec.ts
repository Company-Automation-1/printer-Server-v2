import { Test, TestingModule } from '@nestjs/testing';
import { PrinterController } from './printer.controller';
import { PrinterService } from './printer.service';
import { PrinterMonthlyService } from './printer-monthly.service';
import { SseGatewayService } from '../shared/sse-gateway.service';
import { ResponseService } from '../middlewares/response';
import { BaseService } from '../base/base.service';

describe('PrinterController', () => {
  let controller: PrinterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrinterController],
      providers: [
        { provide: PrinterService, useValue: {} },
        { provide: PrinterMonthlyService, useValue: {} },
        { provide: SseGatewayService, useValue: {} },
        { provide: ResponseService, useValue: {} },
        { provide: BaseService, useValue: {} },
      ],
    }).compile();

    controller = module.get<PrinterController>(PrinterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
