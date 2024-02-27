import { TypeOrmModuleOptions } from '@nestjs/typeorm'

export const dataBaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'bibliogestion_test',
  autoLoadEntities: true,
  synchronize: true,
}
