import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Persona } from 'src/modules/personas/entities/persona.entity';
import { DetalleConductore } from 'src/modules/detalle_conductores/entities/detalle_conductore.entity';
import { VehiculoSeguro } from 'src/modules/vehiculo-seguros/entities/vehiculo-seguro.entity';
import { Tuc } from 'src/modules/tuc/entities/tuc.entity';
import { Empadronamiento } from 'src/modules/empadronamiento/entities/empadronamiento.entity';

@Entity('vehiculos')
export class Vehiculo {
  @PrimaryGeneratedColumn({ name: 'id_vehi' })
  id: number;

  @Column({ type: 'varchar', length: 2000 })
  imagen_url: string;

  @Column({ type: 'varchar', length: 15, unique: true })
  placa: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  n_tarjeta: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  n_motor: string;

  @Column({ type: 'varchar', length: 50 })
  marca: string;

  @Column({ type: 'varchar', length: 20 })
  color: string;

  @Column({ type: 'year', name: 'ano_de_compra' })
  ano_de_compra: number;

  // Relaciones con la entidad Persona para los propietarios
  @ManyToOne(() => Persona, (persona) => persona.vehiculosPropietario1, {
    nullable: false,
  })
  @JoinColumn({ name: 'propietario_1_id' })
  propietario1: Persona; // Propietario 1

  @ManyToOne(() => Persona, (persona) => persona.vehiculosPropietario2, {
    nullable: true,
  })
  @JoinColumn({ name: 'propietario_2_id' })
  propietario2: Persona; // Propietario 2

  @Column({ type: 'tinyint', default: 1 })
  estado: number;

  @Column({ type: 'varchar', length: 400, nullable: true })
  detalle_baja: string;

  @Column()
  id_usuario: number;

  @Column({ name: 'id_usuario_modificacion', nullable: true })
  id_usuario_modificacion: number | null;

  @CreateDateColumn()
  fecha_registro: Date;

  @UpdateDateColumn()
  fecha_modificacion: Date;

  @OneToMany(() => DetalleConductore, (detalle) => detalle.vehiculo)
  detalles: DetalleConductore[];

  @OneToMany(
    () => VehiculoSeguro,
    (vehiculoSeguro) => vehiculoSeguro.id_vehiculo,
  )
  vehiculosSeguros: VehiculoSeguro[];

  @OneToMany(() => Tuc, (Tuc) => Tuc.id_vehiculo)
  Tucs: Tuc[];

  @OneToMany(
    () => Empadronamiento,
    (empadronamiento) => empadronamiento.id_vehiculo,
  )
  EmpadronamientoVehiculo: Empadronamiento[];
}
