import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common'
import { User } from './../auth/entities/user.entity'
import { Book } from './../book/entities/book.entity'
import { Lending } from './entities/lending.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { instanceToPlain, plainToInstance } from 'class-transformer'

@Injectable()
export class LendingService {
  constructor(
    @InjectRepository(Lending)
    private readonly lendingRepository: Repository<Lending>,
    private dataSource: DataSource,
  ) {}

  async lendBook(user: User, book: Book): Promise<Lending> {
    if (!book.isAvailable()) throw new ConflictException('Book not available')

    let lending: Lending

    try {
      lending = user.takeABook(book)
    } catch (e) {
      throw new BadRequestException(e.message)
    }

    if (!(await lending.isValid())) {
      throw new BadRequestException('Invalid lending')
    }

    await this.dataSource.transaction(async (manager) => {
      lending = await manager.save(lending)
      await manager.save(book)
    })

    return lending
  }

  async returnBook(lending: Lending) {
    lending.returnBook()
    lending.returnDate = new Date()

    await this.dataSource.transaction(async (manager) => {
      lending = await manager.save(lending)
      await manager.save(lending.book)
    })

    return this.hideBookQuantity(lending)
  }

  findOne(lendingID: number) {
    return this.lendingRepository.findOne({
      where: { id: lendingID },
      relations: ['book', 'user'],
    })
  }

  async findUserLendingHistory(user: User): Promise<Lending[]> {
    const lending = await this.lendingRepository.find({
      where: { user: user },
      relations: ['book', 'book.authors', 'user'],
    })

    return lending.map((lending) => this.hideBookQuantity(lending))
  }

  private hideBookQuantity(lending: Lending): Lending {
    const lendingPlain = instanceToPlain(lending)
    delete lendingPlain.book.quantity
    const lendingModified = plainToInstance(Lending, lendingPlain)
    return lendingModified
  }

  resetDatabase() {
    return this.dataSource.query('DELETE FROM lending')
  }
}
