import {
  ArrayNotEmpty,
  IsArray,
  IsISBN,
  IsInt,
  IsNotEmpty,
  Min,
  validate,
} from 'class-validator'
import { BookDto, UpdateBookDto } from '../dto/book.dto'
import { NotAvailableError } from '../../errors/notAvailable.error'
import { Column, Entity, JoinTable, ManyToMany, PrimaryColumn } from 'typeorm'
import { Author } from '../../author/entities/author.entity'
import { User } from './../../auth/entities/user.entity'
import { Lending } from './../../lending/entities/lending.entity'

@Entity()
export class Book {
  @PrimaryColumn('varchar', { length: 13, unique: true, nullable: false })
  @IsISBN(undefined, {
    message: 'ISBN must be a valid 10 or 13 characters ISBN.',
  })
  ISBN: string

  @Column('varchar', { length: 255, nullable: false })
  @IsNotEmpty({ message: 'Title must not be empty.' })
  title: string

  @ManyToMany(() => Author, (author) => author.books)
  @JoinTable()
  @IsArray({ message: 'Authors must be an array.' })
  @ArrayNotEmpty({ message: 'Authors must not be empty.' })
  authors: Author[]

  @Column('int', { default: 1, nullable: false })
  @IsInt({ message: 'Quantity must be an integer.' })
  @Min(1, { message: 'Quantity must be at least 1.' })
  quantity: number

  constructor(
    ISBN: string,
    title: string,
    authors: Author[],
    quantity: number = 1,
  ) {
    this.ISBN = ISBN ? ISBN.replace(/-/g, '') : ISBN
    this.title = title
    this.authors = authors
    this.quantity = quantity
  }

  toDto(): BookDto {
    return {
      ISBN: this.ISBN,
      title: this.title,
      authors: this.authors,
      quantity: this.quantity,
    }
  }

  static fromDto(dto: BookDto | UpdateBookDto): Book {
    return new Book(
      dto.ISBN,
      dto.title,
      dto.authors.map((author) => Author.fromDto(author)),
      dto.quantity,
    )
  }

  async isValid() {
    const errors = await validate(this)
    return errors.length === 0
  }

  isAvailable() {
    return this.quantity > 0
  }

  borrowTo(user: User): Lending {
    if (!this.isAvailable()) {
      throw new NotAvailableError('Book is not available')
    }
    this.quantity -= 1
    const lending = new Lending(null, user, this, new Date())
    return lending
  }

  return() {
    this.quantity += 1
  }
}
