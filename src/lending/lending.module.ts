import { Module } from '@nestjs/common'
import { LendingService } from './lending.service'
import { LendingController } from './lending.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Lending } from './entities/lending.entity'
import { AuthModule } from './../auth/auth.module'
import { BookModule } from 'src/book/book.module'

@Module({
  imports: [TypeOrmModule.forFeature([Lending]), AuthModule, BookModule],
  controllers: [LendingController],
  providers: [LendingService],
})
export class LendingModule {}
