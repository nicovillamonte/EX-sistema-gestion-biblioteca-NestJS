import { Test, TestingModule } from '@nestjs/testing'
import { BookController } from './book.controller'
import { BookService } from './book.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BookDto, UpdateBookDto } from './dto/book.dto'
import { Book } from './entities/book.entity'
import { HttpException, HttpStatus } from '@nestjs/common'
import { Author } from './../author/entities/author.entity'
import { AuthorService } from './../author/author.service'

let testBooks: Book[] = []

describe('BookController', () => {
  let service: BookService
  let controller: BookController

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookController],
      providers: [
        BookService,
        AuthorService,
        {
          name: 'BookRepository',
          provide: getRepositoryToken(Book),
          useClass: Repository,
        },
        {
          name: 'AuthorRepository',
          provide: getRepositoryToken(Author),
          useClass: Repository,
        },
      ],
    }).compile()
    service = module.get<BookService>(BookService)
    controller = module.get<BookController>(BookController)
  })

  beforeEach(async () => {
    testBooks = [
      new Book(
        '9783161484100',
        'Libro de Prueba 1',
        [new Author('Nicolas Villamonte')],
        2,
      ),
      new Book(
        '1783161483400',
        'Libro de Prueba 2',
        [new Author('Ruben Juarez'), new Author('Nicolas Menendez')],
        1,
      ),
    ]

    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('create should create a book and return it', async () => {
    const book: Book = new Book(
      '978-3-16-148410-0',
      'test',
      [new Author('test')],
      1,
    )

    jest.clearAllMocks()

    jest.spyOn(service, 'create').mockResolvedValue(book)

    const result = await controller.create(book)

    expect(service.create).toHaveBeenCalledTimes(1)
    expect(result).toEqual(book)
  })

  it('create with invalid book arguments should throw an error', async () => {
    const book: BookDto = new Book(
      '', // Campo inválido que debería causar un error.
      'test',
      [new Author('test')],
      1,
    )

    jest.spyOn(service, 'create').mockImplementation(async (bookToCreate) => {
      if (!(await Book.fromDto(bookToCreate).isValid()))
        throw new HttpException('Invalid book', HttpStatus.BAD_REQUEST)
      return bookToCreate
    })

    await expect(controller.create(book)).rejects.toThrow(HttpException)
  })

  it('Search a book by complete ISBN', async () => {
    const searchQuery = '978-3-16-148410-0'
    console.info('LLEGO BIEN AL TEST')

    jest.spyOn(service, 'search').mockImplementation(async (query) => {
      return testBooks.filter((book) => book.ISBN === query.replace(/-/g, ''))
    })

    console.info('ESPIO BIEN')

    const books = await controller.search(searchQuery)

    console.info('BUSCO BIEN EL LIBRO', books)

    expect(service.search).toHaveBeenCalledTimes(1)
    expect(books).toEqual([testBooks[0]])
  })

  it('Search a book by title', async () => {
    const searchQuery = 'Libro de Prueba'

    jest.spyOn(service, 'search').mockImplementation(async (query) => {
      return testBooks.filter((book) =>
        book.title.toLowerCase().includes(query.toLowerCase()),
      )
    })

    const books = await controller.search(searchQuery)

    expect(service.search).toHaveBeenCalledTimes(1)
    expect(books).toEqual([testBooks[0], testBooks[1]])
  })

  it('Search a book by author', async () => {
    const searchQuery = 'Nico'

    jest.spyOn(service, 'search').mockImplementation(async (query) => {
      return testBooks.filter((book) =>
        book.authors.some(
          (author) =>
            author.name.toLowerCase().indexOf(query.toLowerCase()) !== -1,
        ),
      )
    })

    const books = await controller.search(searchQuery)

    expect(service.search).toHaveBeenCalledTimes(1)
    expect(books).toEqual(testBooks) // Todos tienen un autor que contiene 'Nico'
  })

  it('Update a book information', async () => {
    const isbn = '978-3-16-148410-0'
    const updateBookDto: UpdateBookDto = {
      title: 'Libro con otro nombre',
    }

    const expectedResult: BookDto = {
      ISBN: '9783161484100',
      title: 'Libro con otro nombre',
      authors: [new Author('Nicolas Villamonte')],
      quantity: 2,
    }

    jest.spyOn(service, 'search').mockImplementation(async (query) => {
      return testBooks.filter(
        (book) => book.ISBN.replace(/-/g, '') === query.replace(/-/g, ''),
      )
    })

    jest
      .spyOn(service, 'update')
      .mockImplementation(async (book: Book, updateBookDto: UpdateBookDto) => {
        const updated = Object.assign(book, updateBookDto)
        return updated
      })

    const result = await controller.update(isbn, updateBookDto)

    expect(service.update).toHaveBeenCalledTimes(1)
    expect(result).toEqual(expectedResult)
  })

  it('Delete a book', async () => {
    const isbn = '978-3-16-148410-0'

    jest.spyOn(service, 'search').mockImplementation(async (query) => {
      return testBooks.filter(
        (book) => book.ISBN.replace(/-/g, '') === query.replace(/-/g, ''),
      )
    })

    jest.spyOn(service, 'remove').mockImplementation(async (book: Book) => {
      testBooks = testBooks.filter(({ ISBN }) => ISBN !== book.ISBN)
    })

    const previousBooksLength = testBooks.length

    await controller.remove(isbn)

    expect(service.remove).toHaveBeenCalledTimes(1)
    expect(testBooks.length).toBe(previousBooksLength - 1)
  })

  it("Throw an error trying to delete a book that doesn't exist", async () => {
    const isbn = '978-3-16-148410-0'

    jest
      .spyOn(service, 'remove')
      .mockRejectedValue(
        new HttpException('Book not found', HttpStatus.NOT_FOUND),
      )

    await expect(controller.remove(isbn)).rejects.toThrow(HttpException)
  })
})
