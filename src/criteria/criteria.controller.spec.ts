import { Test, TestingModule } from '@nestjs/testing';
import { CriteriaController } from './criteria.controller';

describe('CriteriaController', () => {
  let controller: CriteriaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CriteriaController],
    }).compile();

    controller = module.get<CriteriaController>(CriteriaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
