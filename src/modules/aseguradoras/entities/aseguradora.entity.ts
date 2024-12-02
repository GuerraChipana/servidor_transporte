import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { VehiculoSeguro } from 'src/modules/vehiculo-seguros/entities/vehiculo-seguro.entity';
@Entity('aseguradoras')
export class Aseguradora {
  @PrimaryGeneratedColumn({ name: 'id_aseg' })
  id: number;

  @Column({ length: 50 })
  aseguradora: string;

  @Column({ type: 'tinyint', default: 1 })
  estado: number;

  @Column({ type: 'varchar', length: 400, nullable: true })
  detalle_baja: string;

  @Column({ name: 'id_usuario' })
  id_usuario: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  fecha_registro: Date;

  @Column({ name: 'id_usuario_modificacion', nullable: true })
  id_usuario_modificacion: number | null;

  @UpdateDateColumn({ type: 'datetime' })
  fecha_modificacion: Date;

  @OneToMany(() => VehiculoSeguro, (vehiculoSeg) => vehiculoSeg.id_aseguradora)
  vehiculosSeguros: VehiculoSeguro[];
}
