import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Book } from '../../book/entities/book.entity'
import { AuthorDto } from '../dto/author.dto'

@Entity()
export class Author {
  @PrimaryGeneratedColumn()
  id?: number

  @Column()
  name: string

  @ManyToMany(() => Book, (book) => book.authors)
  @JoinColumn({ name: 'bookISBN' })
  books: Book[]

  constructor(name: string) {
    this.name = name
  }

  static fromDto(authorDto: Partial<AuthorDto>): Author {
    const author = new Author(authorDto.name)
    author.id = authorDto.id || null
    author.books = authorDto.books
    return author
  }
}
