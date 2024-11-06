import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Length } from 'class-validator';

export class UpdateAsociacioneDto {
  @ApiProperty({
    description: 'Nombre de la asociación',
    minLength: 5,
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @Length(5, 100, {
    message: 'El nombre debe contar mínimo con 5 caracteres',
  })
  nombre?: string;

  @ApiProperty({
    description: 'Documento de la asociación',
    minLength: 10,
    maxLength: 200,
    required: false,
  })
  @IsOptional()
  @Length(10, 200, {
    message: 'El documento debe contar mínimo con 10 caracteres',
  })
  documento?: string;
}
