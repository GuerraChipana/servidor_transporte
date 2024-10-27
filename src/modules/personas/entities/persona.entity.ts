// persona.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { UserSistema } from '../../user_sistemas/entities/user_sistema.entity';

@Entity('personas')
export class Persona {
  @PrimaryGeneratedColumn({ name: 'id_pers' })
  id_pers: number;

  // Otras propiedades...

  @ManyToOne(() => UserSistema, (user) => user.personas)
  id_usuario: UserSistema;

  @ManyToOne(() => UserSistema, (user) => user.personas)
  id_usuario_modificacion: UserSistema;
}
