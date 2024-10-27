import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Persona } from 'src/modules/personas/entities/persona.entity';
//   import { Asociacion } from './asociacion.entity';
//   import { Aseguradora } from './aseguradora.entity';
//   import { Vehiculo } from './vehiculo.entity';
//   import { VehiculoSeguro } from './vehiculo-seguro.entity';
//   import { Conductor } from './conductor.entity';
//   import { Empadronamiento } from './empadronamiento.entity';
//   import { Tuc } from './tuc.entity';

export enum Rol {
  SUPERADMINISTRADOR = 'superadministrador',
  ADMINISTRADOR = 'administrador',
  MODERADOR = 'moderador',
  ASISTENTE = 'asistente',
}

@Entity('user_sistemas')
export class UserSistema {
  @PrimaryGeneratedColumn({ name: 'id_user' })
  id_user: number;

  @Column({ type: 'varchar', length: 8, unique: true })
  dni: string;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ name: 'ap_paterno', type: 'varchar', length: 100 })
  apPaterno: string;

  @Column({ name: 'ap_materno', type: 'varchar', length: 100 })
  apMaterno: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  usuario: string;

  @Column({ type: 'varchar', length: 255 })
  contrasena: string;

  @Column({ type: 'enum', enum: Rol })
  rol: Rol;

  @Column({ type: 'tinyint', default: 1 })
  estado: number;

  @Column({ type: 'varchar', length: 400, nullable: true })
  detalle_baja: string;

  @Column({ name: 'id_usuario' })
  id_usuario: number;

  @Column({ name: 'id_usuario_modificacion' })
  id_usuario_modificacion: number;

  @CreateDateColumn({ name: 'fecha_registro' })
  fecha_registro: Date; // Crea la fecha automaticamente cuando se agrega un registro

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fecha_modificacion: Date; // Actuliza automaticamente cuando se modifica el registro

  // Relaciones
  @OneToMany(() => Persona, (persona) => persona.id_usuario)
  personas: Persona[];

  // @OneToMany(() => Asociacion, asociacion => asociacion.id_usuario)
  // asociaciones: Asociacion[];

  // @OneToMany(() => Aseguradora, aseguradora => aseguradora.id_usuario)
  // aseguradoras: Aseguradora[];

  // @OneToMany(() => Vehiculo, vehiculo => vehiculo.id_usuario)
  // vehiculos: Vehiculo[];

  // @OneToMany(() => VehiculoSeguro, vehiculoSeguro => vehiculoSeguro.id_usuario)
  // vehiculoSeguros: VehiculoSeguro[];

  // @OneToMany(() => Conductor, conductor => conductor.id_usuario)
  // conductores: Conductor[];

  // @OneToMany(() => Empadronamiento, empadronamiento => empadronamiento.id_usuario)
  // empadronamientos: Empadronamiento[];

  // @OneToMany(() => Tuc, tuc => tuc.id_usuario)
  // tucs: Tuc[];
}
