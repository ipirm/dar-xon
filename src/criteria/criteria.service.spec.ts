import { Test, TestingModule } from '@nestjs/testing';
import { CriteriaService } from './criteria.service';

describe('CriteriaService', () => {
  let service: CriteriaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CriteriaService],
    }).compile();

    service = module.get<CriteriaService>(CriteriaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
