import { Test, TestingModule } from '@nestjs/testing';
import { OtaService } from './ota.service';

describe('OtaService', () => {
  let service: OtaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OtaService],
    }).compile();

    service = module.get<OtaService>(OtaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
