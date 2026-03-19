import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { OtaService } from './ota.service';
import { StorageService } from '../shared/storage';
import { OtaRepository } from '../repositories';
import { MqttService } from '../shared/mqtt.service';

describe('OtaService', () => {
  let service: OtaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtaService,
        { provide: StorageService, useValue: {} },
        { provide: OtaRepository, useValue: {} },
        { provide: getDataSourceToken(), useValue: {} },
        { provide: MqttService, useValue: {} },
      ],
    }).compile();

    service = module.get<OtaService>(OtaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
