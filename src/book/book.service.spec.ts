import { Test, TestingModule } from '@nestjs/testing'
import { BookService } from './book.service'
import { Book } from './entities/book.entity'
import { HttpException, NotFoundException } from '@nestjs/common'
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm'
import { AuthorService } from './../author/author.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Author } from './../author/entities/author.entity'

describe('BookService', () => {
  let service: BookService
  let repository: Repository<Book>

  let items: Book[] = []

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookService,
        {
          provide: AuthorService,
          useValue: {
            findByName: jest.fn((name: string) => {
              return new Author(name)
            }),
            create: jest.fn((name: string) => {
              return new Author(name)
            }),
          },
        },
        {
          name: 'BookRepository',
          provide: getRepositoryToken(Book),
          useValue: {
            save: jest.fn((book: Book) => {
              items.push(book)
              return book
            }),
            findOne: jest.fn((options: FindOneOptions<Book>) => {
              const book = items.find(
                (item) =>
                  item.ISBN.replace(/-/g, '') ===
                  options.where['ISBN'].replace(/-/g, ''),
              )
              return book
            }),
            find: jest.fn((_) => {
              /** Implement in specific test */
            }),
            remove: jest.fn((book: Book) => {
              items = items.filter(
                (item) => item.ISBN !== book.ISBN.replace(/-/g, ''),
              )
              return book
            }),
          },
        },
        {
          name: 'AuthorRepository',
          provide: getRepositoryToken(Author),
          useClass: Repository<Author>,
        },
      ],
    }).compile()

    service = module.get<BookService>(BookService)
    repository = module.get<Repository<Book>>('BookRepository')
  })

  beforeEach(async () => {
    items = [
      new Book(
        '978-3-16-148410-0',
        'Libro de Prueba 1',
        [new Author('Nicolas Villamonte')],
        2,
      ),
    ]

    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should throw an error if the book is invalid', async () => {
      const invalidBook = new Book('invalid-ISBN', '', [], -1) // Asumiendo que esto crea un libro inválido

      jest.spyOn(invalidBook, 'isValid').mockResolvedValue(false)

      await expect(service.create(invalidBook)).rejects.toThrow(HttpException)
    })

    it('should call the repository to create a book', async () => {
      const book = new Book(
        '978-3-16-148430-0',
        'Libro de Prueba',
        [new Author('Nicolas Villamonte')],
        2,
      )

      jest.spyOn(book, 'isValid').mockResolvedValue(true)

      const result = await service.create(book)

      expect(repository.save).toHaveBeenCalledWith(book)
      expect(result).toEqual(book)
    })

    it('should throw an error if the book already exists', async () => {
      const book = new Book(
        '978-3-16-148410-0',
        'Libro de Prueba',
        [new Author('Nicolas Villamonte')],
        2,
      )

      jest.spyOn(book, 'isValid').mockResolvedValue(true)
      jest
        .spyOn(repository, 'save')
        .mockRejectedValue(new HttpException('Book already exists', 409))

      await expect(service.create(book)).rejects.toThrow(HttpException)
    })
  })

  describe('search', () => {
    it('should call the repository to get a book with the complete ISBN', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([items[0]])

      const result = await service.search('978-3-16-148410-0')

      expect(repository.find).toHaveBeenCalledWith({
        where: [
          { title: expect.any(Object) },
          { ISBN: '9783161484100' },
          { authors: { name: expect.any(Object) } },
        ],
        relations: ['authors'],
      })
      expect(repository.find).toHaveBeenCalledTimes(1)
      expect(result).toEqual([items[0]])
    })

    it('should call the repository to get a book with a partial book title', async () => {
      const searchQuery = 'libro de'

      jest
        .spyOn(repository, 'find')
        .mockImplementation(async (options: FindManyOptions<Book>) => {
          return items.filter((item) =>
            item.title
              .toLowerCase()
              .includes(
                options.where[0].title.value.replace(/%/g, '').toLowerCase(),
              ),
          )
        })

      const result = await service.search(searchQuery)

      expect(repository.find).toHaveBeenCalledWith({
        where: [
          { title: expect.objectContaining({ _value: `%${searchQuery}%` }) },
          { ISBN: expect.any(String) },
          { authors: { name: expect.any(Object) } },
        ],
        relations: ['authors'],
      })
      expect(repository.find).toHaveBeenCalledTimes(1)
      expect(result).toEqual([items[0]])
    })

    it('should call the repository to get a book with a partial author name', async () => {
      const searchQuery = 'nico'

      jest
        .spyOn(repository, 'find')
        .mockImplementation(async (options: FindManyOptions<Book>) => {
          return items.filter((item) =>
            item.authors.some(
              (author) =>
                author.name.toLowerCase().indexOf(searchQuery.toLowerCase()) !==
                -1,
            ),
          )
        })

      const result = await service.search(searchQuery)

      expect(repository.find).toHaveBeenCalledWith({
        where: [
          { title: expect.any(Object) },
          { ISBN: expect.any(String) },
          {
            authors: expect.objectContaining({
              name: expect.objectContaining({ _value: `%${searchQuery}%` }),
            }),
          },
        ],
        relations: ['authors'],
      })
      expect(repository.find).toHaveBeenCalledTimes(1)
      expect(result).toEqual([items[0]])
    })

    it('should throw an Not Found Exception if the book is not found', async () => {
      jest
        .spyOn(repository, 'find')
        .mockRejectedValue(new NotFoundException('Book not found'))

      await expect(service.search('978-3-16-148410-0')).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('update', () => {
    it('should call the repository to update a book', async () => {
      const updateBook = {
        title: 'New title',
        authors: [new Author('New author')],
        quantity: 1,
      }

      jest.spyOn(repository, 'save').mockResolvedValue(items[0])

      const result = await service.update(items[0], updateBook)

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ISBN: '9783161484100',
        }),
      )
      expect(result).toEqual(items[0])
    })
  })
})
