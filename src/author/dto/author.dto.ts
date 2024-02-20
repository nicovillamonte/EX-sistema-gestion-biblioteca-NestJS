import { Book } from '../../book/entities/book.entity'

export class AuthorDto {
  id: number
  name: string
  books: Book[]
}
