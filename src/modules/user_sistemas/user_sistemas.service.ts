import { Injectable } from '@nestjs/common';
import { CreateUserSistemaDto } from './dto/create-user_sistema.dto';
import { UpdateUserSistemaDto } from './dto/update-user_sistema.dto';

@Injectable()
export class UserSistemasService {
  create(createUserSistemaDto: CreateUserSistemaDto) {
    return 'This action adds a new userSistema';
  }

  findAll() {
    return `This action returns all userSistemas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userSistema`;
  }

  update(id: number, updateUserSistemaDto: UpdateUserSistemaDto) {
    return `This action updates a #${id} userSistema`;
  }

  remove(id: number) {
    return `This action removes a #${id} userSistema`;
  }
}
