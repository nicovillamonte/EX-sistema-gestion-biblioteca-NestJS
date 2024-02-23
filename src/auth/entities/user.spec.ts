import { User } from './user.entity'
import { Book } from './../../book/entities/book.entity'
import { Author } from './../../author/entities/author.entity'

describe('User Entity', () => {
  it('should be defined', () => {
    expect(new User(1, 'usuario', 'usuario@gmail.com', 'REe.34k#djD'))
  })

  describe('User validation', () => {
    it('should be invalid when name is empty', async () => {
      const user = new User(undefined, '', 'usuario@gmail.com', 'REe.34k#djD')
      expect(await user.isValid()).toBeFalsy()
    })

    it('should be invalid when email is empty', async () => {
      const user = new User(undefined, 'usuario', '', 'REe.34k#djD')
      expect(await user.isValid()).toBeFalsy()
    })

    it('should be invalid when email is not a valid email', async () => {
      const user = new User(undefined, 'usuario', 'usuario', 'REe.34k#djD')
      expect(await user.isValid()).toBeFalsy()
    })

    it('should be invalid when password is empty', async () => {
      const user = new User(undefined, 'usuario', 'usuario@gmail.com', '')
      expect(await user.isValid()).toBeFalsy()
    })

    it('should be invalid when password is weak', async () => {
      const user = new User(undefined, 'usuario', 'usuario@gmail.com', '123')
      expect(await user.isValid()).toBeFalsy()
    })

    it('should be valid when all fields are correct', async () => {
      const user = new User(
        undefined,
        'usuario',
        'usuario@gmail.com',
        'REe.34k#djD',
      )
      expect(await user.isValid()).toBeTruthy()
    })
  })

  describe('When user interact with a book', () => {
    it('should be able to take a book', () => {
      const user = new User(1, 'usuario', 'usuario@gmail.com', 'REe.34k#djD')
      const book = new Book('Titulo', '3425645345', [new Author('Autor1')], 3)
      user.takeABook(book)

      expect(book.quantity).toBe(2)
    })

    it('should be able to return a book', () => {
      const user = new User(1, 'usuario', 'usuario@gmail.com', 'REe.34k#djD')
      const book = new Book('Titulo', '3425645345', [new Author('Autor1')], 3)
      user.takeABook(book)

      user.returnBook(book)

      expect(book.quantity).toBe(3)
    })
  })
})
