import { Module } from '@nestjs/common';
import { UserSistemasService } from './user_sistemas.service';
import { UserSistemasController } from './user_sistemas.controller';

@Module({
  controllers: [UserSistemasController],
  providers: [UserSistemasService],
})
export class UserSistemasModule {}
