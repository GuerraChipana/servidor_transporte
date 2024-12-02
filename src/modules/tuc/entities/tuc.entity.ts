import { Asociacione } from 'src/modules/asociaciones/entities/asociacione.entity';
import { Vehiculo } from 'src/modules/vehiculos/entities/vehiculo.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EstadoVigencia {
  Vencido = 'Vencido',
  No_vencido = 'No Vencido',
}

@Entity('tuc')
export class Tuc {
  @PrimaryGeneratedColumn({ name: 'id_tuc' })
  id_tuc: number;

  @Column({ name: 'n_tuc' })
  n_tuc: number;

  @Column({ name: 'ano_tuc', type: 'year', nullable: true })
  ano_tuc: number;

  @ManyToOne(() => Asociacione, (asociacion) => asociacion.Tucs)
  @JoinColumn({ name: 'id_asociacion' })
  id_asociacion: Asociacione;

  @ManyToOne(() => Vehiculo, (vehiculo) => vehiculo.Tucs)
  @JoinColumn({ name: 'id_vehiculo' })
  id_vehiculo: Vehiculo;

  @Column({ type: 'date' })
  fecha_desde: Date;

  @Column({ type: 'date', nullable: true })
  fecha_hasta: Date;

  @Column({ type: 'enum', enum: EstadoVigencia })
  estado_vigencia: EstadoVigencia;

  @Column({ type: 'tinyint', default: '1' })
  estado: number;

  @Column({ type: 'varchar', length: 400, nullable: true })
  detalle_baja: string;

  @Column({ name: 'id_usuario' })
  id_usuario: number;

  @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  fecha_registro: Date;

  @Column({ name: 'id_usuario_modificacion', nullable: true })
  id_usuario_modificacion: number | null;

  @UpdateDateColumn({ type: 'datetime' })
  fecha_modificacion: Date;

  @BeforeInsert()
  @BeforeUpdate()
  setFechaHasta() {
    if (this.fecha_desde) {
      const fechaHasta = new Date(this.fecha_desde);
      fechaHasta.setFullYear(fechaHasta.getFullYear() + 1); // Aumenta un año
      this.fecha_hasta = fechaHasta;

      // Calcula el estado de vigencia
      const currentDate = new Date();
      if (this.fecha_hasta < currentDate) {
        this.estado_vigencia = EstadoVigencia.Vencido;
      } else {
        this.estado_vigencia = EstadoVigencia.No_vencido;
      }
    }
  }
}
