import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { UserSistema } from 'src/modules/user_sistemas/entities/user_sistema.entity';
import { Conductore } from 'src/modules/conductores/entities/conductore.entity';
import { Vehiculo } from 'src/modules/vehiculos/entities/vehiculo.entity';

@Entity('personas')
export class Persona {
  @PrimaryGeneratedColumn({ name: 'id_pers' })
  id: number;

  @Column({ type: 'varchar', length: 8, unique: true })
  dni: string;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ name: 'ap_paterno', type: 'varchar', length: 100 })
  apPaterno: string;

  @Column({ name: 'ap_materno', type: 'varchar', length: 100 })
  apMaterno: string;

  @Column({ type: 'varchar', length: 11, nullable: true })
  telefono: string;

  @Column({ name: 'correo', type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 150 })
  ubigeo: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  domicilio: string;

  @Column({ type: 'text' })
  foto: string;

  @Column({ type: 'tinyint', default: 1 })
  estado: number;

  @Column({ type: 'varchar', length: 400, nullable: true })
  detalle_baja: string;

  @ManyToOne(() => UserSistema, { eager: false })
  @JoinColumn({ name: 'id_usuario' })
  id_usuario: UserSistema;

  @Column()
  id_usuario_modificacion: number;

  @CreateDateColumn({ name: 'fecha_registro' })
  fecha_registro: Date;

  @UpdateDateColumn({ name: 'fecha_modificacion' })
  fecha_modificacion: Date;

  @OneToOne(() => Conductore, (conductor) => conductor.id_persona)
  conductores: Conductore;

  // Relación con Vehiculos
  @OneToMany(() => Vehiculo, (vehiculo) => vehiculo.propietario1) // Relación con los vehículos (propietario1)
  vehiculosPropietario1: Vehiculo[];

  @OneToMany(() => Vehiculo, (vehiculo) => vehiculo.propietario2) // Relación con los vehículos (propietario2)
  vehiculosPropietario2: Vehiculo[];
}
