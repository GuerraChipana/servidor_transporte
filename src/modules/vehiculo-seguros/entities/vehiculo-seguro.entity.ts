import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Vehiculo } from 'src/modules/vehiculos/entities/vehiculo.entity';
import { Aseguradora } from 'src/modules/aseguradoras/entities/aseguradora.entity';

export enum EstadoVencimiento {
  NO_VENCIDO = 'No Vencido',
  VENCIDO = 'Vencido',
}

@Entity('vehiculo_seguros')
export class VehiculoSeguro {
  @PrimaryGeneratedColumn()
  id_vehseg: number;

  @ManyToOne(() => Aseguradora, (aseguradora) => aseguradora.vehiculosSeguros)
  @JoinColumn({ name: 'id_aseguradora' })
  id_aseguradora: Aseguradora;

  @ManyToOne(() => Vehiculo, (vehiculo) => vehiculo.vehiculosSeguros)
  @JoinColumn({ name: 'id_vehiculo' })
  id_vehiculo: Vehiculo;

  @Column({ type: 'varchar', length: 25, nullable: true })
  n_poliza: string;

  @Column({ type: 'date' })
  fecha_vigencia_desde: Date;

  @Column({ type: 'date' })
  fecha_vigencia_hasta: Date;

  @Column({
    type: 'enum',
    enum: EstadoVencimiento,
  })
  estado_vencimiento: EstadoVencimiento;

  @Column({ type: 'tinyint', default: 1 })
  estado: number;

  @Column({ type: 'varchar', length: 400, nullable: true })
  detalle_baja: string | null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_registro: Date;

  @Column({ name: 'id_usuario' })
  id_usuario: number;

  @Column({ name: 'id_usuario_modificacion', nullable: true })
  id_usuario_modificacion: number | null;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  fecha_modificacion: Date;
}
