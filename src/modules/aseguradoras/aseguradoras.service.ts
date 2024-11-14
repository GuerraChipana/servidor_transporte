import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAseguradoraDto } from './dto/create-aseguradora.dto';
import { UpdateAseguradoraDto } from './dto/update-aseguradora.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Aseguradora } from './entities/aseguradora.entity';
import { Not, Repository } from 'typeorm';
import { CambioEstadoAseguradoraDto } from './dto/cambioestado.dto';

@Injectable()
export class AseguradorasService {
  constructor(
    @InjectRepository(Aseguradora)
    private readonly aseguradoraRepository: Repository<Aseguradora>,
  ) {}

  // Función privada asincrona para validar datos
  private async Validacion(
    createUpdateaDto: CreateAseguradoraDto | UpdateAseguradoraDto,
    id?: number,
  ) {
    if (createUpdateaDto.aseguradora) {
      const existeaseguradora = await this.aseguradoraRepository.findOne({
        where: {
          aseguradora: createUpdateaDto.aseguradora,
          id: id ? Not(id) : undefined,
        },
      });
      if (existeaseguradora) {
        throw new BadGatewayException('La aseguradora ya existe');
      }
    }
  }

  // Servicio para crear
  async create(
    createAseguradoraDto: CreateAseguradoraDto,
    id_usuario: number,
  ): Promise<Aseguradora> {
    await this.Validacion(createAseguradoraDto);
    const newAsegu = this.aseguradoraRepository.create({
      ...createAseguradoraDto,
      id_usuario,
    });
    return await this.aseguradoraRepository.save(newAsegu);
  }

  // Servicio para actualizar
  async update(
    id: number,
    updateAseguradoraDto: UpdateAseguradoraDto,
    id_usuario_modificacion: number,
  ): Promise<Aseguradora> {
    const asegu = await this.aseguradoraRepository.findOne({ where: { id } });
    if (!asegu) throw new NotFoundException('Asegurada no encontrada');
    await this.Validacion(updateAseguradoraDto, id);
    asegu.id_usuario_modificacion = id_usuario_modificacion;
    Object.assign(asegu, updateAseguradoraDto);

    return await this.aseguradoraRepository.save(asegu);
  }

  // Servicio para listar
  async findAll(): Promise<Aseguradora[]> {
    const asegu = await this.aseguradoraRepository.find();
    return asegu;
  }
  // Servicio para buscar por id
  async findOne(id: number): Promise<Aseguradora> {
    const asegu = await this.aseguradoraRepository.findOne({ where: { id } });
    if (!asegu) throw new NotFoundException('Aseguradora no encontrada');
    return asegu;
  }

  async estado(
    id: number,
    cambioEstadoAseguradoraDto: CambioEstadoAseguradoraDto,
    id_usuario_modificacion: number,
  ): Promise<Aseguradora> {
    const asegu = await this.aseguradoraRepository.findOne({ where: { id } });
    if (!asegu) throw new NotFoundException('Aseguradora no encontrada ');

    asegu.estado = cambioEstadoAseguradoraDto.estado;

    if (cambioEstadoAseguradoraDto.estado === 0) {
      if (!cambioEstadoAseguradoraDto.detalle_baja)
        throw new BadGatewayException(
          'Especificar el motivo para desactivar el estado',
        );

      asegu.detalle_baja = cambioEstadoAseguradoraDto.detalle_baja;
    } else {
      asegu.detalle_baja = null;
    }
    asegu.id_usuario_modificacion = id_usuario_modificacion;
    return await this.aseguradoraRepository.save(asegu);
  }
}
