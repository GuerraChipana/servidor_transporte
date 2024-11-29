import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Persona } from './entities/persona.entity';
import { UserSistema } from '../user_sistemas/entities/user_sistema.entity';
import { lastValueFrom } from 'rxjs';
import { ImagenesService } from '../imagenes/imagenes.service';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { DatosPersona } from './datos-persona.interface';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { CambioEstadoPersonaDto } from './dto/estado-persona.dto';
import { CreatePersonaDto } from './dto/create-persona.dto';

@Injectable()
export class PersonaService {
  constructor(
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,

    @InjectRepository(UserSistema)
    private readonly userRepository: Repository<UserSistema>,

    private readonly httpService: HttpService,
    private readonly imagenesService: ImagenesService,
  ) {}

  // Servicio para crear Persona //
  async create(
    createPersonaDto: CreatePersonaDto,
    id_user: number,
  ): Promise<Persona> {
  
    const { dni, telefono, email, password_consulta } = createPersonaDto;

    const user = await this.userRepository.findOne({ where: { id_user } });
    if (!user) {
      throw new InternalServerErrorException('Usuario no encontrado');
    }

    // Llamada a la API
    const apiUrl = `${process.env.RENIEC_API}?nuDniConsulta=${dni}&nuDniUsuario=${user.dni}&nuRucUsuario=${process.env.RENIEC_RUC}&password=${password_consulta}&out=json`;
    console.log('URL de la API:', apiUrl);

    let personaData: DatosPersona;
    try {
      const response: AxiosResponse = await lastValueFrom(
        this.httpService.get(apiUrl),
      );
      personaData = response.data.consultarResponse?.return?.datosPersona;

      if (!personaData) {
        throw new InternalServerErrorException(
          'Datos de persona no encontrados',
        );
      }
    } catch (error) {
      this.handleApiError(error);
    }

    // Validar datos necesarios
    const { prenombres, apPrimer, apSegundo, direccion, ubigeo, foto } =
      personaData;

    // Subir la imagen a la subcarpeta "personas"
    let imageUrl;
    try {
      const subFolder = 'personas';
      imageUrl = await this.imagenesService.uploadBase64Image(
        foto,
        `${dni}.jpg`,
        subFolder, // Pasa la subcarpeta
      );
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al subir la imagen: ${error.message}`,
      );
    }

    const fullImageUrl = imageUrl;

    // Validar si el DNI ya existe
    const existingPersonaByDni = await this.personaRepository.findOne({
      where: { dni },
    });
    if (existingPersonaByDni) {
      throw new ConflictException('Ya existe una persona con este DNI.');
    }

    // Validar si el email ya existe
    if (email) {
      const existingPersonaByEmail = await this.personaRepository.findOne({
        where: { email },
      });
      if (existingPersonaByEmail) {
        throw new ConflictException('Ya existe una persona con este email.');
      }
    }

    // Crear la entidad Persona
    const persona = this.personaRepository.create({
      id_usuario: user,
      dni,
      nombre: prenombres,
      apPaterno: apPrimer,
      apMaterno: apSegundo,
      domicilio: direccion,
      ubigeo,
      telefono,
      email,
      foto: fullImageUrl,
    });

    // Guardar la entidad
    try {
      return await this.personaRepository.save(persona);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al guardar la persona: ' + error.message,
      );
    }
  }

  // Servicio para encontrar una persona por ID
  async findById(id: number): Promise<Persona> {
    const persona = await this.personaRepository.findOne({ where: { id } });
    if (!persona) {
      throw new NotFoundException('Persona no encontrada');
    }
    return persona;
  }

  // Servicio para listar personas
  async listar(rol: string): Promise<Partial<Persona>[]> {
    const personas = await this.personaRepository.find();

    // Filtramos según el rol que se acceda
    return personas.map((persona) => {
      switch (rol) {
        case 'superadministrador':
          return persona; // Todo lo puede visualizar
        case 'administrador':
          const {
            id_usuario,
            id_usuario_modificacion,
            fecha_registro,
            fecha_modificacion,
            ...RestoDatos
          } = persona;
          return RestoDatos; // Todo los campos menos los excluidos
        case 'moderador':
        case 'asistente':
          const {
            id,
            dni,
            nombre,
            apPaterno,
            apMaterno,
            telefono,
            foto,
            email,
          } = persona;
          return {
            id,
            dni,
            nombre,
            apPaterno,
            apMaterno,
            telefono,
            foto,
            email,
          };
        default:
          return {};
      }
    });
  }

  async changeStatus(
    id: number,
    cambioEstadoPersonaDto: CambioEstadoPersonaDto,
    id_usuario_modificacion: number,
  ): Promise<Persona> {
    const persona = await this.personaRepository.findOne({ where: { id } });
    if (!persona) {
      throw new NotFoundException('Persona no encontrada');
    }

    // Obtener el usuario que está realizando la modificación
    const usuarioModificacion = await this.userRepository.findOne({
      where: { id_user: id_usuario_modificacion },
    });
    if (!usuarioModificacion) {
      throw new NotFoundException('Usuario de modificación no encontrado');
    }

    // Cambiar el estado de la persona
    persona.estado = cambioEstadoPersonaDto.estado;

    // Validar detalle_baja si el estado es inactivo
    if (cambioEstadoPersonaDto.estado === 0) {
      if (!cambioEstadoPersonaDto.detalle_baja) {
        throw new BadRequestException(
          'Se requiere un detalle de baja cuando el estado es inactivo',
        );
      }
      persona.detalle_baja = cambioEstadoPersonaDto.detalle_baja;
    } else {
      persona.detalle_baja = null; // Resetear detalle_baja si está activo
    }

    // Asignar el usuario de modificación y la fecha
    persona.id_usuario_modificacion = usuarioModificacion.id_user;

    // Guardar los cambios
    return await this.personaRepository.save(persona);
  }

  // Servicio para editar dato de la persona
  async update(
    id: number,
    updatePersonaDto: UpdatePersonaDto,
    id_usuario_modificacion: number,
  ): Promise<Persona> {
    const persona = await this.personaRepository.findOne({
      where: { id, estado: 1 },
    });

    if (!persona) {
      throw new NotFoundException('Persona no se encuentra activa');
    }

    // Validar que el email no se repita si se proporciona
    if (updatePersonaDto.email) {
      const existingPersonaByEmail = await this.personaRepository.findOne({
        where: { email: updatePersonaDto.email },
      });
      if (existingPersonaByEmail && existingPersonaByEmail.id !== persona.id) {
        throw new ConflictException('Ya existe una persona con este email.');
      }
    }

    // Actualizar solo los campos que se proporcionan
    Object.assign(persona, updatePersonaDto);

    // Obtener el usuario que está realizando la modificación
    const usuarioModificacion = await this.userRepository.findOne({
      where: { id_user: id_usuario_modificacion },
    });
    if (!usuarioModificacion) {
      throw new NotFoundException('Usuario de modificación no encontrado');
    }

    // Asignar el objeto de usuario de modificación
    persona.id_usuario_modificacion = usuarioModificacion.id_user;

    // Guardar los cambios en la base de datos
    try {
      return await this.personaRepository.save(persona);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al actualizar la persona: ' + error.message,
      );
    }
  }

  private handleApiError(error: any) {
    if (error.response) {
      throw new InternalServerErrorException(
        `Error en la API: ${JSON.stringify(error.response.data)}`,
      );
    } else if (error.request) {
      throw new InternalServerErrorException(
        'No se recibió respuesta de la API',
      );
    } else {
      throw new InternalServerErrorException(
        `Error al configurar la solicitud: ${error.message}`,
      );
    }
  }
}
