import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Persona } from 'src/modules/personas/entities/persona.entity';

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

  @Column({ name: 'usuario', type: 'varchar', length: 50, unique: true })
  username: string;

  @Column({ name: 'correo', type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ name: 'contrasena', type: 'varchar', length: 255 })
  password: string;

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
  fecha_registro: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fecha_modificacion: Date;

  @OneToMany(() => Persona, (persona) => persona.id_usuario)
  personas: Persona[];
}
