import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Book } from './../../book/entities/book.entity'
import { User } from './../../auth/entities/user.entity'
import { IsObject, IsOptional, validate } from 'class-validator'
import { LendingDto } from '../dto/lending.dto'
import { IsValidDate } from './../../utils/validators/isValidDate.validator'

@Entity()
export class Lending {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => Book)
  @IsObject()
  book: Book

  @ManyToOne(() => User) //, (user) => user.lendings
  @IsObject()
  user: User

  @Column()
  @IsValidDate({
    message: 'Return date must be a valid date.',
  })
  lendingDate: Date

  @Column({ nullable: true })
  @IsValidDate({
    message: 'Return date must be a valid date.',
  })
  @IsOptional()
  returnDate?: Date

  constructor(
    id: number,
    user: User,
    book: Book,
    lendingDate: Date,
    returnDate?: Date,
  ) {
    this.id = id
    this.book = book
    this.user = user
    this.lendingDate = lendingDate
    this.returnDate = returnDate
  }

  static fromDto(dto: Partial<LendingDto>, user: User, book: Book): Lending {
    return new Lending(
      dto.lendingId || -1,
      user,
      book,
      dto.borrowDate,
      dto.returnDate,
    )
  }

  toDto(): LendingDto {
    return {
      lendingId: this.id,
      userId: this.user.id,
      bookISBN: this.book.ISBN,
      borrowDate: this.lendingDate,
      returnDate: this.returnDate,
    }
  }

  async isValid() {
    const errors = await validate(this)
    return errors.length === 0
  }

  returnBook() {
    this.user.returnBook(this.book)
  }
}
