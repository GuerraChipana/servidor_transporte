import { PartialType } from '@nestjs/swagger';
import { CreateEmpadronamientoDto } from './create-empadronamiento.dto';

export class UpdateEmpadronamientoDto extends PartialType(CreateEmpadronamientoDto) {}
