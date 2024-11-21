import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAsociacioneDto } from './dto/create-asociacione.dto';
import { UpdateAsociacioneDto } from './dto/update-asociacione.dto';
import { Asociacione } from './entities/asociacione.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CambioEstadoAcociacionDto } from './dto/cambio_estado-asociacione.dto';

@Injectable()
export class AsociacionesService {
  constructor(
    @InjectRepository(Asociacione)
    private readonly asociacionRepository: Repository<Asociacione>,
  ) {}

  // Método de validación común para verificar nombre y documento
  private async validarExistencia(
    createOrUpdateDto: CreateAsociacioneDto | UpdateAsociacioneDto,
    id?: number,
  ) {
    // Validamos si ya existe la asociación por nombre
    if (createOrUpdateDto.nombre) {
      const existeNombre = await this.asociacionRepository.findOne({
        where: {
          nombre: createOrUpdateDto.nombre,
          id: id ? Not(id) : undefined,
        },
      });
      if (existeNombre) {
        throw new BadRequestException('El nombre de la asociación ya existe');
      }
    }

    // Validamos si ya existe la asociación por documento
    if (createOrUpdateDto.documento) {
      const existeDoc = await this.asociacionRepository.findOne({
        where: {
          documento: createOrUpdateDto.documento,
          id: id ? Not(id) : undefined,
        },
      });
      if (existeDoc) {
        throw new BadRequestException(
          'El documento ya existe para otra asociación',
        );
      }
    }
  }

  // Servicio para crear una asociación
  async create(
    createAsociacioneDto: CreateAsociacioneDto,
    id_usuario: number,
  ): Promise<Asociacione> {
    await this.validarExistencia(createAsociacioneDto); // Validación antes de crear
    const newAsoci = this.asociacionRepository.create({
      ...createAsociacioneDto,
      id_usuario,
    });

    return await this.asociacionRepository.save(newAsoci);
  }

  // Servicio para actualizar una asociación
  async update(
    id: number,
    updateAsociacioneDto: UpdateAsociacioneDto,
    id_usuario_modificacion: number,
  ): Promise<Asociacione> {
    const asoci = await this.asociacionRepository.findOne({
      where: { id, estado: 1 },
    });
    if (!asoci) {
      throw new NotFoundException('Asociación no se encuentra activa');
    }

    await this.validarExistencia(updateAsociacioneDto, id);

    asoci.id_usuario_modificacion = id_usuario_modificacion;

    Object.assign(asoci, updateAsociacioneDto);

    return await this.asociacionRepository.save(asoci);
  }

  // Servicio para listar asociaciones
  async findAll(): Promise<Asociacione[]> {
    const asocianes = await this.asociacionRepository.find();
    return asocianes;
  }
  // Servicio para buscar asociacion por id
  async findOne(id: number): Promise<Asociacione> {
    const asoci = await this.asociacionRepository.findOne({ where: { id } });
    if (!asoci) {
      throw new NotFoundException('Asociacion no encontrada');
    }
    return asoci;
  }

  // Servicio para cambiar de estado
  async estado(
    id: number,
    cambioEstadoAcociacionDto: CambioEstadoAcociacionDto,
    id_usuario_modificacion: number,
  ): Promise<Asociacione> {
    const asoci = await this.asociacionRepository.findOne({ where: { id } });
    if (!asoci) {
      throw new NotFoundException('Asociacion no encontrada');
    }
    // cambio de estado
    asoci.estado = cambioEstadoAcociacionDto.estado;

    if (cambioEstadoAcociacionDto.estado === 0) {
      if (!cambioEstadoAcociacionDto.detalle_baja) {
        throw new BadRequestException(
          'Se requiere un detalle si se cambia baja la asociacion ',
        );
      }
      asoci.detalle_baja = cambioEstadoAcociacionDto.detalle_baja;
    } else {
      asoci.detalle_baja = null;
    }

    asoci.id_usuario_modificacion = id_usuario_modificacion;
    return await this.asociacionRepository.save(asoci);
  }
}
