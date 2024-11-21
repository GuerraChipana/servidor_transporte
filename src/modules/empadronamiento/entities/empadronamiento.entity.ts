import { Vehiculo } from 'src/modules/vehiculos/entities/vehiculo.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('empadronamientos')
export class Empadronamiento {
  @PrimaryGeneratedColumn() id_empa: number;

  @Column() n_empadronamiento: number;

  @ManyToOne(() => Vehiculo, (vehiculo) => vehiculo.EmpadronamientoVehiculo)
  @JoinColumn({ name: 'id_vehiculo' })
  id_vehiculo: Vehiculo;

  @Column({ type: 'tinyint', name: 'estado', default: 1 }) estado: number;

  @Column({ type: 'varchar', name: 'detalle_baja' }) detalle_baja: string;

  @Column() id_usuario: number;

  @Column() id_usuario_modificacion: number | null;

  @CreateDateColumn() fecha_registro: Date;

  @UpdateDateColumn() fecha_modificacion: Date;
}
