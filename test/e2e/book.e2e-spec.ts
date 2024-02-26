import * as request from 'supertest'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { BookModule } from '../../src/book/book.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { dataBaseConfig } from '../../src/config/database-test.config'

describe('Book API (e2e)', () => {
  const path = '/book'
  let app: INestApplication

  beforeAll(async () => {
    process.env.WITH_AUTH = 'false'
  })

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [BookModule, TypeOrmModule.forRoot(dataBaseConfig)],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  it('Create Book (POST /book)', () => {
    return request(app.getHttpServer())
      .post(path)
      .send({
        ISBN: '9780132350884',
        title: 'Clean Code',
        authors: [
          {
            name: 'Robert C. Martin',
          },
        ],
        quantity: 1,
      })
      .expect(201)
  })

  it(`Search Book (GET /book/search/:isbn)`, () => {
    const query = '9780132350884'

    return request(app.getHttpServer())
      .get(`${path}/search/${query}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveLength(1)
        expect(res.body[0].title).toBe('Clean Code')
      })
  })

  it('Update Book (PATCH /book/:isbn)', () => {
    const ISBN = '9780132350884'
    const updatedBook = {
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      authors: [
        {
          name: 'Romero Malaquias',
        },
        {
          name: 'Luis Gustavo',
        },
      ],
      quantity: 3,
    }

    return request(app.getHttpServer())
      .patch(`${path}/${ISBN}`)
      .send(updatedBook)
      .expect(200)
      .expect((res) => {
        expect(res.body.title).toBe(updatedBook.title)
        expect(res.body.authors).toHaveLength(updatedBook.authors.length)
        expect(res.body.quantity).toBe(updatedBook.quantity)
      })
  })

  it('Remove Book (DELETE /book/:isbn)', () => {
    const ISBN = '9780132350884'

    return request(app.getHttpServer()).delete(`${path}/${ISBN}`).expect(200)
  })
})
