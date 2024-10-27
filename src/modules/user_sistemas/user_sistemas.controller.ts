import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserSistemasService } from './user_sistemas.service';
import { CreateUserSistemaDto } from './dto/create-user_sistema.dto';
import { UpdateUserSistemaDto } from './dto/update-user_sistema.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Usuarios de Sistema')
@Controller('user-sistemas')
export class UserSistemasController {
  constructor(private readonly userSistemasService: UserSistemasService) {}

  @Post()
  create(@Body() createUserSistemaDto: CreateUserSistemaDto) {
    return this.userSistemasService.create(createUserSistemaDto);
  }

  @Get()
  findAll() {
    return this.userSistemasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userSistemasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserSistemaDto: UpdateUserSistemaDto) {
    return this.userSistemasService.update(+id, updateUserSistemaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userSistemasService.remove(+id);
  }
}
