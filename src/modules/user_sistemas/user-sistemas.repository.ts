import { EntityRepository, Repository } from 'typeorm';
import { UserSistema } from './entities/user_sistema.entity';

@EntityRepository(UserSistema)
export class UserSistemaRepository extends Repository<UserSistema> {}
