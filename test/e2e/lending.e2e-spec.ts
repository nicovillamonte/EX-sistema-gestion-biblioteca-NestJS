import * as request from 'supertest'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import { dataBaseConfig } from '../../src/config/database-test.config'
import { LendingModule } from '../../src/lending/lending.module'
import { BookService } from '../../src/book/book.service'
import { AuthService } from '../../src/auth/auth.service'
import { testUser } from '../../src/data/mock/testUserData.mock'
import { User } from '../../src/auth/entities/user.entity'
import { Book } from '../../src/book/entities/book.entity'
import { Author } from '../../src/author/entities/author.entity'
import { LendingService } from '../../src/lending/lending.service'
import { Lending } from '../../src/lending/entities/lending.entity'

describe('Lending API (e2e)', () => {
  const path = '/lending'
  let app: INestApplication
  let service: LendingService
  let bookService: BookService
  let authService: AuthService

  let book: Book
  let user: User
  let token: string
  let lendingID: string

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [LendingModule, TypeOrmModule.forRoot(dataBaseConfig)],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    service = moduleFixture.get<LendingService>(LendingService)
    bookService = moduleFixture.get<BookService>(BookService)
    authService = moduleFixture.get<AuthService>(AuthService)

    book = await bookService.create(
      new Book(
        '9780132350884',
        'Clean Code',
        [new Author('Robert C. Martin')],
        1,
      ),
      [new Author('Robert C. Martin')],
    )

    user = await authService.createTestUser()
  })

  beforeEach(async () => {
    const userValidation = await authService.validateUser({
      email: testUser.email,
      password: testUser.password,
    })

    if (!userValidation) {
      throw new Error('User not found')
    }

    token = userValidation.access_token
  })

  afterAll(async () => {
    await service.resetDatabase()
    await bookService.remove(book)
    await authService.deleteTestUser()

    await app.close()
  })

  beforeEach(async () => {})

  describe('Lend Book (POST /lending)', () => {
    it('should return a 201 status and the lending information', async () => {
      const response = await request(app.getHttpServer())
        .post(`${path}/9780132350884`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.CREATED)
        .expect(({ body: lending }: { body: Lending }) => {
          expect(lending).toHaveProperty('id')
          expect(lending.user.id).toBe(user.id)
          expect(lending.book.ISBN).toBe(book.ISBN)
        })

      lendingID = response.body.id

      const bookResponse = await bookService.search('9780132350884')
      expect(bookResponse[0].quantity).toBe(0)

      return response
    })
  })

  describe('Return Book (POST /lending/return/:id)', () => {
    it('should return a 201 status and the lending with the returnDate modified. Also, the book should add 1 to the quantity', async () => {
      await request(app.getHttpServer())
        .post(`${path}/return/${lendingID}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.CREATED)
        .expect(({ body: lending }) => {
          expect(lending.returnDate).not.toBe(undefined)
        })

      const bookResponse = await bookService.search('9780132350884')
      expect(bookResponse[0].quantity).toBe(1)
    })

    it('should throw a 404 error when the lending id is not valid', () => {
      return request(app.getHttpServer())
        .post(`${path}/return/-1`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.NOT_FOUND)
    })

    it('Return Book when it was returned before should throw a conflict error', () => {
      return request(app.getHttpServer())
        .post(`${path}/return/${lendingID}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.CONFLICT)
    })
  })

  describe('Lending User History (GET /lending/history)', () => {
    it('should return a 200 status and the user lending history', () => {
      return request(app.getHttpServer())
        .get(`${path}/${user.id}`)
        .expect(HttpStatus.OK)
        .expect(({ body: lendings }: { body: Lending[] }) => {
          expect(lendings.length).toBe(1)
          expect(lendings[0].user.id).toBe(user.id)
          expect(lendings[0].user).not.toHaveProperty('password')
          expect(lendings[0].book).not.toHaveProperty('quantity')
        })
    })

    it('should throw a 404 error when the user id is not valid', () => {
      return request(app.getHttpServer())
        .get(`${path}/-1`)
        .expect(HttpStatus.NOT_FOUND)
    })
  })
})
