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
import { BuscarPersonaDto } from './dto/buscar-persona.dto';
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

  async consultarPersona(
    bucarPersonaDto: BuscarPersonaDto,
    id_user: number,
  ): Promise<any> {
    const { dni, password_consulta } = bucarPersonaDto;

    const user = await this.userRepository.findOne({ where: { id_user } });
    if (!user) {
      throw new InternalServerErrorException('Usuario no encontrado');
    }

    // Llamada a la API
    const apiUrl = `${process.env.RENIEC_API}/api/proxy/reniec?nuDniConsulta=${dni}&nuDniUsuario=${user.dni}&nuRucUsuario=${process.env.RENIEC_RUC}&password=${password_consulta}&out=json`;
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

    // Validar los datos y preparar los datos a retornar (sin subir la imagen)
    const { prenombres, apPrimer, apSegundo, direccion, ubigeo, foto } =
      personaData;

    // Retornar los datos sin subir la imagen
    return {
      dni,
      nombre: prenombres,
      apPaterno: apPrimer,
      apMaterno: apSegundo,
      direccion,
      ubigeo,
      foto, // Devolver la imagen en Base64 sin subirla
    };
  }

  // Servicio para crear Persona //
  async crearPersona(
    createPersonaDto: CreatePersonaDto,
    id_usuario: number,
  ): Promise<Persona> {
    const {
      dni,
      telefono,
      email,
      nombre,
      apPaterno,
      apMaterno,
      direccion,
      ubigeo,
      foto,
    } = createPersonaDto;

    // 2. Verificar si el usuario existe
    const user = await this.userRepository.findOne({
      where: { id_user: id_usuario },
    });
    if (!user) {
      throw new InternalServerErrorException('Usuario no encontrado');
    }

    const [existingPersonaByDni, existingPersonaByEmail] = await Promise.all([
      this.personaRepository.findOne({ where: { dni } }),
      email ? this.personaRepository.findOne({ where: { email } }) : null,
    ]);

    if (existingPersonaByDni) {
      throw new ConflictException('Ya existe una persona con este DNI.');
    }
    if (existingPersonaByEmail) {
      throw new ConflictException('Ya existe una persona con este email.');
    }

    // 4. Subir la imagen solo si es necesario
    let imageUrl;
    try {
      const subFolder = 'personas';
      imageUrl = await this.imagenesService.uploadBase64Image(
        foto,
        `${dni}.jpg`,
        subFolder,
      );
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al subir la imagen: ${error.message}`,
      );
    }

    // 5. Crear la entidad Persona
    const persona = this.personaRepository.create({
      id_usuario: user, // Solo se guarda el ID de usuario
      dni,
      nombre,
      apPaterno: apPaterno,
      apMaterno: apMaterno,
      domicilio: direccion,
      ubigeo,
      telefono,
      email,
      foto: imageUrl, // Foto ya subida de manera definitiva
    });

    // 6. Guardar la persona en la base de datos
    try {
      const savedPersona = await this.personaRepository.save(persona);

      // 7. Recuperar los detalles de la persona guardada, con las relaciones necesarias
      const personaDetalle = await this.personaRepository.findOne({
        where: { id: savedPersona.id },
        relations: ['id_usuario'], // Si deseas devolver detalles del usuario relacionado
        select: {
          id: true,
          dni: true,
          nombre: true,
          apPaterno: true,
          apMaterno: true,
          domicilio: true,
          ubigeo: true,
          telefono: true,
          email: true,
          foto: true,
          id_usuario: {
            id_user: true,
          },
        },
      });

      // 8. Devolver los datos relevantes (sin el objeto completo de usuario)
      return personaDetalle;
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

  // Cambiar estado de la persona
  async changeStatus(
    id: number,
    cambioEstadoPersonaDto: CambioEstadoPersonaDto,
    id_usuario_modificacion: number,
  ): Promise<Persona> {
    const persona = await this.personaRepository.findOne({ where: { id } });
    if (!persona) {
      throw new NotFoundException('Persona no encontrada');
    }

    const usuarioModificacion = await this.userRepository.findOne({
      where: { id_user: id_usuario_modificacion },
    });
    if (!usuarioModificacion) {
      throw new NotFoundException('Usuario de modificación no encontrado');
    }

    persona.estado = cambioEstadoPersonaDto.estado;
    persona.detalle_baja =
      cambioEstadoPersonaDto.estado === 0
        ? cambioEstadoPersonaDto.detalle_baja
        : null;
    persona.id_usuario_modificacion = usuarioModificacion.id_user;

    try {
      return await this.personaRepository.save(persona);
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al cambiar estado: ' + error.message,
      );
    }
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

    const usuarioModificacion = await this.userRepository.findOne({
      where: { id_user: id_usuario_modificacion },
    });
    if (!usuarioModificacion) {
      throw new NotFoundException('Usuario de modificación no encontrado');
    }

    persona.id_usuario_modificacion = usuarioModificacion.id_user;

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
