import { IsString, IsNotEmpty, Length, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CambiarCredencialesDto {
  @ApiProperty({
    description: 'Nuevo nombre de usuario',
    minLength: 2,
    maxLength: 50,
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(2, 50)
  username?: string;

  @ApiProperty({
    description: 'Contraseña actual',
    minLength: 8,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @Length(8, 255)
  password_actual: string;

  @ApiProperty({
    description: 'Nueva contraseña',
    minLength: 8,
    maxLength: 255,
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(8, 255)
  password_nueva?: string;

  @ApiProperty({
    description: 'Confirmación de nueva contraseña',
    minLength: 8,
    maxLength: 255,
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(8, 255)
  confirmacion_password?: string;
}
