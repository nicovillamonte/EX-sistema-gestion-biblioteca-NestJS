import * as request from 'supertest'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import { dataBaseConfig } from './../src/config/database-test.config'
import { LendingModule } from './../src/lending/lending.module'
import { BookService } from './../src/book/book.service'
import { AuthService } from './../src/auth/auth.service'
import { testUser } from './../src/data/mock/testUserData.mock'
import { User } from './../src/auth/entities/user.entity'
import { Book } from './../src/book/entities/book.entity'
import { Author } from './../src/author/entities/author.entity'
import { LendingService } from './../src/lending/lending.service'
import { Lending } from './../src/lending/entities/lending.entity'

describe('Lending API (e2e)', () => {
  const path = '/lending'
  let app: INestApplication
  let service: LendingService
  let bookService: BookService
  let authService: AuthService

  let book: Book
  let user: User
  let token: string

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

  it('Lend Book (POST /lending)', () => {
    return request(app.getHttpServer())
      .post(`${path}/9780132350884`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
      .expect(({ body: lending }: { body: Lending }) => {
        expect(lending).toHaveProperty('id')
        expect(lending.user.id).toBe(user.id)
        expect(lending.book.ISBN).toBe(book.ISBN)
      })
  })
})
