import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { User } from './../auth/entities/user.entity'
import { Book } from './../book/entities/book.entity'
import { Lending } from './entities/lending.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { classToPlain, instanceToInstance } from 'class-transformer'
import { BookService } from './../book/book.service'

@Injectable()
export class LendingService {
  constructor(
    @InjectRepository(Lending)
    private readonly lendingRepository: Repository<Lending>,
    private readonly bookService: BookService,
    private dataSource: DataSource,
  ) {}

  async lendBook(user: User, book: Book): Promise<Lending> {
    if (!book.isAvailable())
      throw new HttpException('Book not available', HttpStatus.CONFLICT)

    let lending: Lending

    try {
      lending = user.takeABook(book)
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST)
    }

    if (!(await lending.isValid())) {
      throw new HttpException('Invalid lending', HttpStatus.BAD_REQUEST)
    }

    await this.dataSource.transaction(async (manager) => {
      lending = await manager.save(lending)
      await manager.save(book)
    })

    return lending
  }

  resetDatabase() {
    return this.dataSource.query('DELETE FROM lending')
  }
}
