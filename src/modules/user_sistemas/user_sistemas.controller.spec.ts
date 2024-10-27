import { Test, TestingModule } from '@nestjs/testing';
import { UserSistemasController } from './user_sistemas.controller';
import { UserSistemasService } from './user_sistemas.service';

describe('UserSistemasController', () => {
  let controller: UserSistemasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserSistemasController],
      providers: [UserSistemasService],
    }).compile();

    controller = module.get<UserSistemasController>(UserSistemasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
