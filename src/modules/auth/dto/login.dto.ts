import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Nombre alias del usuario' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Contraseña del usuario' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
