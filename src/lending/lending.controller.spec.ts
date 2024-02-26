import { Test, TestingModule } from '@nestjs/testing'
import { LendingController } from './lending.controller'
import { LendingService } from './lending.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Lending } from './entities/lending.entity'
import { Repository } from 'typeorm'
import { BookService } from './../book/book.service'
import { AuthService } from './../auth/auth.service'
import { User } from './../auth/entities/user.entity'
import { JwtService } from '@nestjs/jwt'
import { Book } from './../book/entities/book.entity'
import { Author } from './../author/entities/author.entity'
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common'

describe('LendingController', () => {
  let service: LendingService
  let controller: LendingController

  let authService: AuthService
  let bookService: BookService

  let userReq: any

  const mockLendingService = {
    findOne: jest.fn(),
    lendBook: jest.fn(),
    returnBook: jest.fn(),
    findUserLendingHistory: jest.fn(),
  }

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LendingController],
      providers: [
        AuthService,
        JwtService,
        {
          provide: LendingService,
          useValue: mockLendingService,
        },
        {
          provide: BookService,
          useValue: {
            search: jest.fn(),
          },
        },
        {
          name: 'BookRepository',
          provide: getRepositoryToken(Lending),
          useClass: Repository,
        },
        {
          name: 'UserRepository',
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile()

    service = module.get<LendingService>(LendingService)
    controller = module.get<LendingController>(LendingController)
    authService = module.get<AuthService>(AuthService)
    bookService = module.get<BookService>(BookService)
  })

  beforeEach(async () => {
    userReq = {
      user: {
        id: 3,
        name: 'Test User',
        email: 'test@gmail.com',
        access_token:
          'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MDg5NjI0MjcsImV4cCI6MTc0MDQ5ODQyNywiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6IkpvaG5ueSIsIlN1cm5hbWUiOiJSb2NrZXQiLCJFbWFpbCI6Impyb2NrZXRAZXhhbXBsZS5jb20iLCJSb2xlIjpbIk1hbmFnZXIiLCJQcm9qZWN0IEFkbWluaXN0cmF0b3IiXX0.FNsUsenr6xgaOZcCoTFBbsdBcF8tjOujmY_1GmizmSo',
      },
    }

    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('lendBook', () => {
    it('should lend a book', async () => {
      const user = new User(
        userReq.user.id,
        userReq.user.name,
        userReq.user.email,
        userReq.user.access_token,
      )
      const book = new Book(
        '9783161484100',
        'Libro de Prueba 1',
        [new Author('Nicolas Villamonte')],
        2,
      )
      const lending = new Lending(4, user, book, new Date(), null)

      jest.spyOn(authService, 'findOne').mockResolvedValue(user)
      jest.spyOn(bookService, 'search').mockResolvedValue([book])
      mockLendingService.lendBook.mockResolvedValue(lending)

      expect(await controller.create(userReq as any, book.ISBN)).toBe(lending)
      expect(mockLendingService.lendBook).toHaveBeenCalledWith(user, book)
      expect(authService.findOne).toHaveBeenCalledWith(user.id)
      expect(bookService.search).toHaveBeenCalledWith(book.ISBN)
    })

    it('should throw an error if the book is not available', async () => {
      const user = new User(
        userReq.user.id,
        userReq.user.name,
        userReq.user.email,
        userReq.user.access_token,
      )

      const book = new Book(
        '9783161484100',
        'Libro de Prueba 1',
        [new Author('Nicolas Villamonte')],
        0,
      )

      jest.spyOn(authService, 'findOne').mockResolvedValue(user)
      jest
        .spyOn(bookService, 'search')
        .mockRejectedValue(new ConflictException())

      await expect(
        controller.create(userReq as any, book.ISBN),
      ).rejects.toThrow(ConflictException)
    })

    it('should throw an error if the user is not valid', async () => {
      jest.spyOn(authService, 'findOne').mockResolvedValue(null)

      await expect(
        controller.create(userReq as any, '9783161484100'),
      ).rejects.toThrow(NotFoundException)
    })

    it('should throw an error if the book is not found', async () => {
      const user = new User(
        userReq.user.id,
        userReq.user.name,
        userReq.user.email,
        userReq.user.access_token,
      )

      jest.spyOn(authService, 'findOne').mockResolvedValue(user)
      jest.spyOn(bookService, 'search').mockResolvedValue([])

      await expect(
        controller.create(userReq as any, '9783161484100'),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('return', () => {
    it('should return a book', async () => {
      const book = new Book(
        '9783161484100',
        'Libro de Prueba 1',
        [new Author('Nicolas Villamonte')],
        2,
      )

      const user = new User(
        userReq.user.id,
        userReq.user.name,
        userReq.user.email,
        userReq.user.access_token,
      )

      const lending = new Lending(4, user, book, new Date(), null)

      mockLendingService.findOne.mockResolvedValue(lending)
      jest.spyOn(authService, 'findOne').mockResolvedValue(user)
      mockLendingService.returnBook.mockImplementation(() => {
        lending.returnBook()
        lending.returnDate = new Date()
        return lending
      })

      expect(await controller.return(userReq as any, lending.id)).toBe(lending)
      expect(mockLendingService.returnBook).toHaveBeenCalledWith(lending)
    })

    it('should throw an error if the lending is not found', async () => {
      mockLendingService.findOne.mockResolvedValue(null)

      await expect(controller.return(userReq as any, 4)).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should throw an error if the book is already returned', async () => {
      const book = new Book(
        '9783161484100',
        'Libro de Prueba 1',
        [new Author('Nicolas Villamonte')],
        2,
      )

      const user = new User(
        userReq.user.id,
        userReq.user.name,
        userReq.user.email,
        userReq.user.access_token,
      )

      const lending = new Lending(4, user, book, new Date(), new Date())

      mockLendingService.findOne.mockResolvedValue(lending)

      await expect(
        controller.return(userReq as any, lending.id),
      ).rejects.toThrow(ConflictException)
    })

    it('should throw an error if the user is not allowed to return the book', async () => {
      const book = new Book(
        '9783161484100',
        'Libro de Prueba 1',
        [new Author('Nicolas Villamonte')],
        2,
      )

      const user = new User(
        userReq.user.id,
        userReq.user.name,
        userReq.user.email,
        userReq.user.access_token,
      )

      const lending = new Lending(4, user, book, new Date(), null)

      mockLendingService.findOne.mockResolvedValue(lending)

      const user2 = new User(5, 'Test User 2', 'test2@gmail.com', 'password')

      jest.spyOn(authService, 'findOne').mockResolvedValue(user2)

      await expect(
        controller.return(userReq as any, lending.id),
      ).rejects.toThrow(ForbiddenException)
    })

    it('should throw an error if the user is not found', async () => {
      jest.spyOn(authService, 'findOne').mockResolvedValue(null)

      await expect(controller.return(userReq as any, 4)).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('history', () => {
    it('should return the user lending history', async () => {
      const user = new User(
        userReq.user.id,
        userReq.user.name,
        userReq.user.email,
        userReq.user.access_token,
      )

      const lending = new Lending(
        4,
        user,
        new Book(
          '9783161484100',
          'Libro de Prueba 1',
          [new Author('Nicolas Villamonte')],
          2,
        ),
        new Date(),
        null,
      )

      mockLendingService.findUserLendingHistory.mockResolvedValue([lending])
      jest.spyOn(authService, 'findOne').mockResolvedValue(user)

      expect(await controller.history(user.id)).toEqual([lending])
      expect(mockLendingService.findUserLendingHistory).toHaveBeenCalledWith(
        user,
      )
      expect(authService.findOne).toHaveBeenCalledWith(user.id)
    })

    it('should throw an error if the user is not found', async () => {
      jest.spyOn(authService, 'findOne').mockResolvedValue(null)

      await expect(controller.history(4)).rejects.toThrow(NotFoundException)
    })

    it('should throw an error if the user is not found', async () => {
      const user = new User(
        userReq.user.id,
        userReq.user.name,
        userReq.user.email,
        userReq.user.access_token,
      )

      jest.spyOn(authService, 'findOne').mockResolvedValue(null)

      await expect(controller.history(user.id)).rejects.toThrow(
        NotFoundException,
      )
    })
  })
})
