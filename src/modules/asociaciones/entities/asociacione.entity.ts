import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
//import { Tuc } from './tuc.entity';

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

  // Relación con la tabla tuc
  // @OneToMany(() => Tuc, tuc => tuc.asociacion)
  // tucs: Tuc[];
}
