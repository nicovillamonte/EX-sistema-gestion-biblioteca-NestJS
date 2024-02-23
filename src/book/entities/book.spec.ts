import { Book } from './book.entity'
import { Author } from './../../author/entities/author.entity'
import BookBuilder from '../builder/book.builder'

describe('Book Entity', () => {
  it('should be defined', () => {
    expect(new Book('Titulo', '3425645345', []))
  })

  describe('Book validation', () => {
    it('"0321543254" is a valid ISBN', async () => {
      const book = new BookBuilder().withIsbn('0321543254').build()
      expect(await book.isValid()).toBeTruthy()
    })

    it('"9780321543257" is a valid ISBN', async () => {
      const book = new BookBuilder().withIsbn('9780321543257').build()
      expect(await book.isValid()).toBeTruthy()
    })

    it('"978-3-16-148410-0" is a valid ISBN', async () => {
      const book = new BookBuilder().withIsbn('978-3-16-148410-0').build()
      expect(await book.isValid()).toBeTruthy()
    })

    it('should be invalid when ISBN is empty', async () => {
      const book = new BookBuilder().withIsbn('').build()
      expect(await book.isValid()).toBeFalsy()
    })

    it('should be invalid when ISBN is not a valid ISBN', async () => {
      const book = new BookBuilder().withIsbn('123').build()
      expect(await book.isValid()).toBeFalsy()
    })

    it('should be invalid when title is empty', async () => {
      const book = new BookBuilder().withTitle('').build()
      expect(await book.isValid()).toBeFalsy()
    })

    it('should be invalid when authors is empty', async () => {
      const book = new BookBuilder().withAuthors([]).build()
      expect(await book.isValid()).toBeFalsy()
    })

    it('should be invalid when quantity is 0', async () => {
      const book = new BookBuilder().quantity(0).build()
      expect(await book.isValid()).toBeFalsy()
    })

    it('should be invalid when quantity is negative', async () => {
      const book = new BookBuilder().quantity(-5).build()
      expect(await book.isValid()).toBeFalsy()
    })

    it('should be valid when all fields are correct', async () => {
      const book = new BookBuilder()
        .withIsbn('978-3-16-148410-0')
        .withTitle('Titulo')
        .withAuthors([new Author('Autor1')])
        .quantity(3)
        .build()
      expect(await book.isValid()).toBeTruthy()
    })
  })

  describe('Book availability', () => {
    it('should be available when quantity is greater than 0', () => {
      const book = new BookBuilder().quantity(3).build()
      expect(book.isAvailable()).toBeTruthy()
    })

    it('should not be available when quantity is 0', () => {
      const book = new BookBuilder().quantity(0).build()
      expect(book.isAvailable()).toBeFalsy()
    })

    it('should substrac 1 from quantity when borrowed', () => {
      const book = new BookBuilder().quantity(3).build()
      book.borrowTo(null)
      expect(book.quantity).toBe(2)
    })

    it('should throw NotAvailableError when borrowed and quantity is 0', () => {
      const book = new BookBuilder().quantity(0).build()
      expect(() => book.borrowTo(null)).toThrow('Book is not available')
    })

    it('should add 1 to quantity when returned', () => {
      const book = new BookBuilder().quantity(3).build()
      book.return()
      expect(book.quantity).toBe(4)
    })
  })
})
