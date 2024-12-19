import { IsEnum, IsNotEmpty } from 'class-validator';
import { Rol } from '../entities/user_sistema.entity';

export class CambiarRolUserDto {
  @IsEnum(Rol, {
    message:
      'El rol debe ser uno de los siguientes: ' + Object.values(Rol).join(', '),
  })
  @IsNotEmpty({ message: 'El rol no puede estar vacío.' })
  rol: Rol;
}
