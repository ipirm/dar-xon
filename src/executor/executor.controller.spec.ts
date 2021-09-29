import { Test, TestingModule } from '@nestjs/testing';
import { ExecutorController } from './executor.controller';

describe('CustomerController', () => {
  let controller: ExecutorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExecutorController],
    }).compile();

    controller = module.get<ExecutorController>(ExecutorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
