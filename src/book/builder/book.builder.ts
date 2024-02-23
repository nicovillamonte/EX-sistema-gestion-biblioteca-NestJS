import { Book } from '../entities/book.entity'
import { Author } from './../../author/entities/author.entity'

class BookBuilder {
  private book: Book

  constructor() {
    this.book = new Book(
      '978-3-16-148410-0',
      'Titulo del Libro',
      [new Author('Autor1'), new Author('Autor2')],
      3,
    )
  }

  withTitle(title: string): BookBuilder {
    this.book.title = title
    return this
  }

  withAuthor(author: Author): BookBuilder {
    this.book.authors.push(author)
    return this
  }

  withAuthors(authors: Author[]): BookBuilder {
    this.book.authors = authors
    return this
  }

  withIsbn(isbn: string): BookBuilder {
    this.book.ISBN = isbn
    return this
  }

  quantity(quantity: number): BookBuilder {
    this.book.quantity = quantity
    return this
  }

  build(): Book {
    return this.book
  }
}

export default BookBuilder
