import { PartialType } from '@nestjs/swagger';
import { CreateUserSistemaDto } from './create-user_sistema.dto';

export class UpdateUserSistemaDto extends PartialType(CreateUserSistemaDto) {}
