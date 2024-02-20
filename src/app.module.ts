import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { dataBaseConfig } from './config/database.config'
import { BookModule } from './book/book.module'
import { AuthorModule } from './author/author.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [BookModule, TypeOrmModule.forRoot(dataBaseConfig), AuthorModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
