import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';
// import { VehiculoSeguros } from './vehiculo-seguro.entity';

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

  //   // Relación inversa (si un vehículo puede tener múltiples seguros, es una relación uno a muchos)
  //   @OneToMany(() => VehiculoSeguros, vehiculoSeguro => vehiculoSeguro.aseguradora)
  //   vehiculoSeguros: VehiculoSeguros[];
}
