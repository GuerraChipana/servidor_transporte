import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Tuc } from 'src/modules/tuc/entities/tuc.entity';

@Entity('asociaciones')
export class Asociacione {
  @PrimaryGeneratedColumn({ name: 'id_asoci' })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 200 })
  documento: string;

  @Column({ type: 'tinyint', default: 1 })
  estado: number;

  @Column({ type: 'varchar', length: 400, nullable: true })
  detalle_baja?: string;

  @Column()
  id_usuario: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_registro: Date;

  @Column()
  id_usuario_modificacion: number;

  @UpdateDateColumn({ type: 'timestamp' })
  fecha_modificacion: Date;

  @OneToMany(() => Tuc, (tuc) => tuc.id_asociacion)
  tuc: Tuc[];
}
