import * as request from 'supertest'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from './../src/auth/auth.module'
import { dataBaseConfig } from './../src/config/database.config'
import { AuthService } from './../src/auth/auth.service'
import { testUser } from './../src/data/mock/testUserData.mock'

describe('Auth API (e2e)', () => {
  let app: INestApplication
  let authService: AuthService

  beforeAll(async () => {
    process.env.WITH_AUTH = 'true'

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, TypeOrmModule.forRoot(dataBaseConfig)],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()

    authService = moduleFixture.get(AuthService)
  })

  afterAll(async () => {
    await authService.deleteTestUser()
    await app.close()
  })

  it('Register (POST /auth/register)', async () => {
    await authService.deleteTestUser()

    return await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: testUser.name,
        email: testUser.email,
        password: testUser.password,
      })
      .expect(HttpStatus.CREATED)
      .expect(({ body: userRegistered }) => {
        expect(userRegistered).toHaveProperty('id')
        expect(userRegistered.name).toBe(testUser.name)
        expect(userRegistered.email).toBe(testUser.email)
        expect(userRegistered).not.toHaveProperty('password')
      })
  })

  it('Register with invalid data (POST /auth/register)', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: testUser.name,
        email: 'testeandoemailinvalido',
        password: testUser.password,
      })
      .expect(HttpStatus.BAD_REQUEST)
  })

  it('Login (POST /auth/login)', async () => {
    return await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(HttpStatus.CREATED)
      .expect(({ body: userLogged }) => {
        expect(userLogged).toHaveProperty('id')
        expect(userLogged).toHaveProperty('access_token')
        expect(userLogged.name).toBe(testUser.name)
        expect(userLogged.email).toBe(testUser.email)
        expect(userLogged).not.toHaveProperty('password')
      })
  })

  it('Login with invalid credentials (POST /auth/login)', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: 'invalidPassword',
      })
      .expect(HttpStatus.UNAUTHORIZED)
  })

  it('Update user (PATCH /auth)', async () => {
    const user = await authService.validateUser({
      email: testUser.email,
      password: testUser.password,
    })

    return request(app.getHttpServer())
      .patch('/auth')
      .set('Authorization', `Bearer ${user.access_token}`)
      .send({
        id: user.id,
        name: 'test2',
      })
      .expect(HttpStatus.OK)
  })

  it('Update user with invalid token (PATCH /auth)', async () => {
    return request(app.getHttpServer())
      .patch('/auth')
      .set('Authorization', `Bearer invalidToken`)
      .send({
        id: 1,
        name: 'test2',
      })
      .expect(HttpStatus.UNAUTHORIZED)
  })

  it('Update user with a id that is not of logged user (PATCH /auth)', async () => {
    const user = await authService.validateUser({
      email: testUser.email,
      password: testUser.password,
    })

    return request(app.getHttpServer())
      .patch('/auth')
      .set('Authorization', `Bearer ${user.access_token}`)
      .send({
        id: 999999999999999,
        name: 'test2',
      })
      .expect(HttpStatus.UNAUTHORIZED)
  })
})
