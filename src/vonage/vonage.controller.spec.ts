import { Test, TestingModule } from '@nestjs/testing';
import { VonageController } from './vonage.controller';

describe('Vonage Controller', () => {
  let controller: VonageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VonageController],
    }).compile();

    controller = module.get<VonageController>(VonageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
