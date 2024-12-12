import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Conductore } from 'src/modules/conductores/entities/conductore.entity';
import { Vehiculo } from 'src/modules/vehiculos/entities/vehiculo.entity';

@Entity('detalle_conductores')
export class DetalleConductore {
  @PrimaryColumn()
  id_conductor: number;

  @PrimaryColumn()
  id_vehiculo: number;

  // Relación con conductor: no puede ser NULL
  @ManyToOne(() => Conductore, (conductor) => conductor.detalles, {
    nullable: false,
  })
  @JoinColumn({ name: 'id_conductor' })
  conductor: Conductore;

  // Relación con vehiculo: no puede ser NULL
  @ManyToOne(() => Vehiculo, (vehiculo) => vehiculo.detalles, {
    nullable: false,
  })
  @JoinColumn({ name: 'id_vehiculo' })
  vehiculo: Vehiculo;
}
