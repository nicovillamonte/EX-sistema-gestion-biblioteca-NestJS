import { Module } from '@nestjs/common'
import { AuthorService } from './author.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Author } from './entities/author.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Author])],
  controllers: [],
  providers: [AuthorService],
  exports: [AuthorService],
})
export class AuthorModule {}
