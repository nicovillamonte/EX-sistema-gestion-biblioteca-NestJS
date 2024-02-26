import { Test, TestingModule } from '@nestjs/testing'
import { BookController } from './../../src/book/book.controller'
import { BookService } from './../../src/book/book.service'
import { FindOneOptions } from 'typeorm'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Book } from './../../src/book/entities/book.entity'
import { AuthorService } from './../../src/author/author.service'
import { Author } from './../../src/author/entities/author.entity'
import { BookDto, UpdateBookDto } from './../../src/book/dto/book.dto'
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common'

describe('Book Integration', () => {
  let bookController: BookController
  let bookService: BookService

  let books: Book[] = []
  const bookRepositoryMock = {
    findOne: jest.fn().mockImplementation((options: FindOneOptions) => {
      const book = books.find(
        (item) =>
          item.ISBN.replace(/-/g, '') ===
          options.where['ISBN'].replace(/-/g, ''),
      )
      return book
    }),
    save: jest.fn().mockImplementation((book) => {
      books.push(book)
      return Promise.resolve(book)
    }),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    find: jest.fn().mockImplementation((options: FindOneOptions) => {
      return books
    }),
    remove: jest.fn().mockImplementation((book) => {
      books = books.filter((item) => item.ISBN !== book.ISBN)
      return Promise.resolve(book)
    }),
  }

  const authors: Author[] = []
  const authorRepositoryMock = {
    findOne: jest.fn().mockImplementation((options: FindOneOptions) => {
      const author = authors.find((item) => item.name === options.where['name'])
      return author
    }), // Mockea aquí según sea necesario
    save: jest.fn().mockImplementation((author) => {
      authors.push(author)
      return Promise.resolve(author)
    }),
    // Añade otros métodos mockeados aquí según sea necesario
  }

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookController],
      providers: [
        BookService,
        AuthorService,
        {
          provide: getRepositoryToken(Book),
          useValue: bookRepositoryMock,
        },
        {
          provide: getRepositoryToken(Author),
          useValue: authorRepositoryMock,
        },
      ],
    }).compile()

    bookService = module.get<BookService>(BookService)
    bookController = module.get<BookController>(BookController)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(bookController).toBeDefined()
    expect(bookService).toBeDefined()
  })

  // Añade tus casos de prueba aquí
  describe('Create a book', () => {
    it('should create a book', async () => {
      const book: BookDto = {
        title: 'Test Book',
        ISBN: '9780132350884',
        authors: [new Author('Test Author')],
        quantity: 1,
      }

      const result = await bookController.create(book)
      expect(result).toEqual(Book.fromDto(book))
      expect(authors.length).not.toBe(0)
    })

    it('should throw a conflict exception when book already exists', async () => {
      const book: BookDto = {
        title: 'Test Book',
        ISBN: '9780132350884',
        authors: [new Author('Test Author')],
        quantity: 1,
      }

      books.push(Book.fromDto(book))

      await expect(bookController.create(book)).rejects.toThrow(
        ConflictException,
      )
    })
  })

  describe('Search for books', () => {
    beforeEach(() => {
      books = [
        new Book('9780132350884', 'Test Book', [new Author('Test Author')], 1),
      ]
    })

    it('should search for books with name', async () => {
      const result = await bookController.search('Test Book')
      expect(result).toEqual(books)
    })

    it('should search for books with partial name', async () => {
      const result = await bookController.search('Test Bo')
      expect(result).toEqual(books)
    })

    it('should search for books with author', async () => {
      const result = await bookController.search('Test Author')
      expect(result).toEqual(books)
    })

    it('should search for books with partial author', async () => {
      const result = await bookController.search('Test Aut')
      expect(result).toEqual(books)
    })

    it('should search for books with ISBN', async () => {
      const result = await bookController.search('9780132350884')
      expect(result).toEqual(books)
    })

    it('should not found the books with partial ISBN', async () => {
      bookRepositoryMock.find.mockResolvedValue([])
      const result = await bookController.search('978013235088')

      expect(result).toEqual([])
    })
  })

  describe('Update a book', () => {
    beforeEach(() => {
      books = [
        new Book('9780132350884', 'Test Book', [new Author('Test Author')], 1),
      ]
      bookRepositoryMock.find.mockResolvedValue(books)
    })

    it('should update a book', async () => {
      const book: UpdateBookDto = {
        title: 'Test Book Edited',
        ISBN: '9780132350884',
        authors: [new Author('Test Author'), new Author('Test Author 2')],
        quantity: 5,
      }

      const result = await bookController.update('9780132350884', book)
      // expect(result).toEqual(Book.fromDto(book))
      expect(result.ISBN).toBe('9780132350884')
      expect(result.authors.length).toBe(2)
      expect(result.quantity).toBe(5)
      expect(result.title).toBe('Test Book Edited')
    })

    it('should throw a not found exception when book does not exist', async () => {
      const book: BookDto = {
        title: 'Test Book',
        ISBN: '9780132350884',
        authors: [new Author('Test Author')],
        quantity: 1,
      }

      bookRepositoryMock.find.mockResolvedValue([])
      await expect(
        bookController.update('9780132350884', book),
      ).rejects.toThrow('Book not found')
    })

    it("should throw a bad request exception when ISBN doesn't match with book", async () => {
      const book: BookDto = {
        title: 'Test Book',
        ISBN: '9780132350885',
        authors: [new Author('Test Author')],
        quantity: 1,
      }

      await expect(
        bookController.update('9780132350884', book),
      ).rejects.toThrow(BadRequestException)
      expect(bookRepositoryMock.find).toHaveBeenCalled()
    })

    it('should throw a not found exception when book is not found', async () => {
      bookRepositoryMock.find.mockResolvedValue([])

      const book: BookDto = {
        title: 'Test Book',
        ISBN: '9780132350885',
        authors: [new Author('Test Author')],
        quantity: 1,
      }

      await expect(
        bookController.update('9780132350885', book),
      ).rejects.toThrow(NotFoundException)
      expect(bookRepositoryMock.find).toHaveBeenCalled()
    })
  })

  describe('Remove a book', () => {
    beforeEach(() => {
      books = [
        new Book('9780132350884', 'Test Book', [new Author('Test Author')], 1),
      ]
      bookRepositoryMock.find.mockResolvedValue(books)
    })

    it('should remove a book', async () => {
      await bookController.remove('9780132350884')
      expect(books.length).toBe(0)
    })

    it('should throw a not found exception when book does not exist', async () => {
      bookRepositoryMock.find.mockResolvedValue([])
      await expect(bookController.remove('9780132350884')).rejects.toThrow(
        NotFoundException,
      )
    })
  })
})
