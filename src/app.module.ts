import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { dataBaseConfig } from './config/database.config'
import { BookModule } from './book/book.module'
import { AuthorModule } from './author/author.module'
import { AuthModule } from './auth/auth.module'
import { ConfigModule } from '@nestjs/config'
import { LendingModule } from './lending/lending.module'

@Module({
  imports: [
    TypeOrmModule.forRoot(dataBaseConfig),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BookModule,
    AuthorModule,
    AuthModule,
    LendingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
