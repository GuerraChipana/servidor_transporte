import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ImagenBase64DTO {
  @ApiProperty({ description: 'Código de la base64' })
  @IsNotEmpty()
  @IsString()
  foto: string;

  @ApiProperty({ description: 'DNI de la persona' })
  @IsNotEmpty()
  @IsString()
  dni: string; // Nuevo campo para el DNI
}
