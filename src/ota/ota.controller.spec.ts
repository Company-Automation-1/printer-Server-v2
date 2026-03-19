import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { OtaController } from './ota.controller';
import { OtaService } from './ota.service';
import { StorageService } from '../shared/storage';
import { OtaRepository } from '../repositories';
import { MqttService } from '../shared/mqtt.service';
import { ResponseService } from '../middlewares/response';
import { BaseService } from '../base/base.service';

describe('OtaController', () => {
  let controller: OtaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OtaController],
      providers: [
        OtaService,
        { provide: StorageService, useValue: {} },
        { provide: OtaRepository, useValue: {} },
        { provide: getDataSourceToken(), useValue: {} },
        { provide: MqttService, useValue: {} },
        { provide: ResponseService, useValue: {} },
        { provide: BaseService, useValue: {} },
      ],
    }).compile();

    controller = module.get<OtaController>(OtaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
