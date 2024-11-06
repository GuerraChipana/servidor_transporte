import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length } from 'class-validator';

export class CreateAsociacioneDto {
  @ApiProperty({
    description: 'Nombre de la asociacion',
    minLength: 5,
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @Length(5, 100, {
    message: 'El nombre debe contar mínimo con 5 caracteres',
  })
  nombre: string;

  @ApiProperty({
    description: 'Documento de la asociacion',
    minLength: 5,
    maxLength: 200,
  })
  @IsNotEmpty({ message: 'El documento no puede estar vacío' })
  @Length(5, 200, {
    message: 'El documento debe contar mínimo con 5 caracteres',
  })
  documento: string;
}
