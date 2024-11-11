import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { Persona } from 'src/modules/personas/entities/persona.entity';

export enum CategoriaLicencia {
  'B-I' = 'B-I',
  'B-IIa' = 'B-IIa',
  'B-IIb' = 'B-IIb',
  'B-IIc' = 'B-IIc',
}

@Entity('conductores')
export class Conductore {
  @PrimaryGeneratedColumn({ name: 'id_conduc' })
  id: number;

  // Relación con Persona (OneToOne)
  @OneToOne(() => Persona)
  @JoinColumn({ name: 'id_persona' })
  id_persona: Persona;

  @Column({ type: 'varchar', length: 25 })
  n_licencia: string;

  @Column({ type: 'date' })
  fecha_desde: Date;

  @Column({ type: 'date' })
  fecha_hasta: Date;

  @Column({ type: 'varchar', length: 10, default: 'Clase B' })
  clase: string;

  @Column({
    type: 'enum',
    enum: CategoriaLicencia,
    default: CategoriaLicencia['B-I'],
  })
  categoria: CategoriaLicencia;

  @Column({ type: 'varchar', length: 50, nullable: true })
  restriccion: string | null;

  @Column({ type: 'varchar', length: 10 })
  g_sangre: string;

  @Column({ type: 'tinyint', default: 1 })
  estado: number;

  @Column({ type: 'varchar', length: 400, nullable: true })
  detalle_baja: string | null;

  @Column({ name: 'id_usuario' })
  id_usuario: number;

  @Column({ name: 'id_usuario_modificacion', nullable: true })
  id_usuario_modificacion: number | null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_registro: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  fecha_modificacion: Date;

  // Hook antes de insertar para calcular la fecha de vencimiento
  @BeforeInsert()
  setFechaHasta() {
    this.fecha_hasta = this.calculateFechaHasta(
      this.categoria,
      this.fecha_desde,
    );
  }

  // Método para calcular la fecha de vencimiento de la licencia
  private calculateFechaHasta(
    categoria: CategoriaLicencia,
    fechaDesde: Date,
  ): Date {
    const anos = 5; // Duración de la licencia en años
    const categoriasValidas = Object.values(CategoriaLicencia);

    // Verificar si la categoría es válida
    if (!categoriasValidas.includes(categoria)) {
      throw new Error('Categoría no válida');
    }

    // Calcular la fecha hasta sumando los años a la fecha de inicio
    const fechaHasta = new Date(fechaDesde);
    fechaHasta.setFullYear(fechaHasta.getFullYear() + anos);
    return fechaHasta;
  }
}
