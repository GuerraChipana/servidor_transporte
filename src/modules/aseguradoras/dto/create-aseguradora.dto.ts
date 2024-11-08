import { IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAseguradoraDto {
  @ApiProperty({
    description: 'Nombre de la aseguradora',
    minLength: 4,
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'El nombre de la aseguradora no puede estar vacio' })
  @Length(4, 50, {
    message: 'La aseguradora debe contar con 4 caracteres como minimo',
  })
  aseguradora: string;
}
