import { Test, TestingModule } from '@nestjs/testing';
import { UserSistemasService } from './user_sistemas.service';

describe('UserSistemasService', () => {
  let service: UserSistemasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserSistemasService],
    }).compile();

    service = module.get<UserSistemasService>(UserSistemasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
