import { DataSource, Repository } from 'typeorm'
import { LendingService } from './lending.service'
import { Lending } from './entities/lending.entity'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { User } from './../auth/entities/user.entity'
import { Book } from './../book/entities/book.entity'
import { BadRequestException, ConflictException } from '@nestjs/common'

describe('LendingService', () => {
  let service: LendingService
  let lendingRepository: Repository<Lending>
  let dataSource: DataSource

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LendingService,
        {
          provide: getRepositoryToken(Lending),
          useClass: Repository,
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<LendingService>(LendingService)
    lendingRepository = module.get<Repository<Lending>>(
      getRepositoryToken(Lending),
    )
    dataSource = module.get<DataSource>(DataSource)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('lendBook', () => {
    it('should be defined', () => {
      expect(service.lendBook).toBeDefined()
    })

    it('should lend a book', async () => {
      jest.spyOn(service, 'lendBook')

      const user = new User(null, 'Test User', 'test@gmail.com', '123456')
      const book = new Book(null, 'Test Book', [], 1)

      const lending = new Lending(null, user, book, new Date())

      jest.spyOn(book, 'isAvailable').mockReturnValue(true)
      jest.spyOn(user, 'takeABook').mockReturnValue(lending)

      const result = await service.lendBook(user, book)

      expect(service.lendBook).toHaveBeenCalled()
      expect(result).toEqual(lending)
    })

    it('should throw a conflict exception when book is not available', async () => {
      const user = new User(null, 'Test User', 'test@gmail.com', '123456')
      const book = new Book(null, 'Test Book', [], 0)

      await expect(service.lendBook(user, book)).rejects.toThrow(
        ConflictException,
      )
    })

    it('should throw an exception when lending is invalid', async () => {
      const user = new User(null, 'Test User', 'test@gmail.com', '123456')
      const book = new Book(null, 'Test Book', [], 1)
      const lending = new Lending(null, user, book, new Date())

      jest.spyOn(book, 'isAvailable').mockReturnValue(true)
      jest.spyOn(user, 'takeABook').mockReturnValue(lending)
      jest.spyOn(lending, 'isValid').mockResolvedValue(false)

      await expect(service.lendBook(user, book)).rejects.toThrow(
        BadRequestException,
      )
    })

    it('should save lending and book', async () => {
      const user = new User(null, 'Test User', 'test@gmail.com', '123456')
      const book = new Book(null, 'Test Book', [], 1)
      const lending = new Lending(null, user, book, new Date())

      jest.spyOn(book, 'isAvailable').mockReturnValue(true)
      jest.spyOn(user, 'takeABook').mockReturnValue(lending)
      jest.spyOn(lending, 'isValid').mockResolvedValue(true)

      await service.lendBook(user, book)

      expect(dataSource.transaction).toHaveBeenCalled()
      expect(book.isAvailable).toHaveBeenCalled()
      expect(user.takeABook).toHaveBeenCalled()
    })
  })

  describe('returnBook', () => {
    it('should be defined', () => {
      expect(service.returnBook).toBeDefined()
    })

    it('should return a book', async () => {
      jest.spyOn(service, 'returnBook')

      const user = new User(null, 'Test User', 'test@gmail.com', '123456')
      const book = new Book(null, 'Test Book', [], 1)

      const lending = new Lending(null, user, book, new Date())

      const result = await service.returnBook(lending)

      delete lending.user.password
      delete lending.book.quantity
      expect(service.returnBook).toHaveBeenCalled()
      expect(result).toEqual(lending)
      expect(lending.returnDate).toBeDefined()
      expect(lending.book.quantity).not.toBeDefined()
      expect(lending.user.password).not.toBeDefined()
    })
  })

  describe('findOne', () => {
    it('should be defined', () => {
      expect(service.findOne).toBeDefined()
    })

    it('should find a lending', async () => {
      const user = new User(null, 'Test User', 'test@gmail.com', '123456')
      const book = new Book(null, 'Test Book', [], 1)
      const lending = new Lending(null, user, book, new Date())

      jest.spyOn(lendingRepository, 'findOne').mockResolvedValue(lending)

      const result = await service.findOne(1)

      expect(lendingRepository.findOne).toHaveBeenCalled()
      expect(result).toEqual(lending)
    })
  })

  describe('findUserLendingHistory', () => {
    it('should be defined', () => {
      expect(service.findUserLendingHistory).toBeDefined()
    })

    it('should find user lending history', async () => {
      const user = new User(null, 'Test User', 'test@gmail.com', '123456')
      const book = new Book(null, 'Test Book', [], 1)

      const lending = new Lending(null, user, book, new Date())
      delete lending.user.password
      delete lending.book.quantity

      jest.spyOn(lendingRepository, 'find').mockResolvedValue([lending])

      const result = await service.findUserLendingHistory(user)

      expect(lendingRepository.find).toHaveBeenCalled()
      expect(result).toEqual([lending])
    })
  })
})
