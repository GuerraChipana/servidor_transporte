import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ImagenDTO {
  @ApiProperty({ description: 'Archivo de la imagen a subir' })
  @IsNotEmpty()
  file: Express.Multer.File;
}
