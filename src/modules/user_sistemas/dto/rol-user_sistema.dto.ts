import { IsEnum, IsNotEmpty } from 'class-validator';
import { Rol } from '../entities/user_sistema.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CambiarRolUserDto {
  @ApiProperty({
    description: 'Roles que el usuario puede tener',
    enum: Rol,
    enumName: 'Rol',
  })
  @IsEnum(Rol, {
    message:
      'El rol debe ser uno de los siguientes: ' + Object.values(Rol).join(', '),
  })
  @IsNotEmpty({ message: 'El rol no puede estar vacío.' })
  rol: Rol;
}
