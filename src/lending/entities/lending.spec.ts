import { Lending } from './lending.entity'
import { User } from './../../auth/entities/user.entity'
import BookBuilder from './../../book/builder/book.builder'

describe('Lending Entity', () => {
  let user: User

  beforeEach(() => {
    user = new User(undefined, 'usuario', 'usuario@mail.com', 'REe.34k#djD')
  })

  it('should be defined', () => {
    const book = new BookBuilder().build()
    expect(new Lending(undefined, user, book, new Date()))
  })

  describe('Lending validation', () => {
    it('should be invalid when lending date is empty', async () => {
      const book = new BookBuilder().build()
      const lending = new Lending(undefined, user, book, undefined)
      expect(await lending.isValid()).toBeFalsy()
    })

    it('should be invalid when lending date is not a valid date', async () => {
      const book = new BookBuilder().build()
      const lending = new Lending(undefined, user, book, new Date('invalid'))
      expect(await lending.isValid()).toBeFalsy()
    })

    it('should be invalid when return date is not a valid date', async () => {
      const book = new BookBuilder().build()
      const lending = new Lending(
        undefined,
        user,
        book,
        new Date(),
        new Date('invalid'),
      )
      expect(await lending.isValid()).toBeFalsy()
    })

    it('should be valid when all fields are correct', async () => {
      const book = new BookBuilder().build()
      const lending = new Lending(undefined, user, book, new Date())
      expect(await lending.isValid()).toBeTruthy()
    })
  })

  it('return a book should increase the quantity of the book', () => {
    const book = new BookBuilder().quantity(3).build()
    const lending = new Lending(undefined, user, book, new Date())
    lending.returnBook()
    expect(book.quantity).toBe(4)
  })
})
