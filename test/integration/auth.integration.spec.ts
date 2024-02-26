import * as request from 'supertest'
import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from './../../src/auth/auth.controller'
import { AuthService } from './../../src/auth/auth.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { User } from './../../src/auth/entities/user.entity'
import { JwtModule } from '@nestjs/jwt'
import { Repository } from 'typeorm'
import { ConflictException, INestApplication } from '@nestjs/common'
import { LocalStrategy } from './../../src/auth/strategies/local.strategy'
import { AuthDto } from './../../src/auth/dto/auth.dto'
import { JwtAuthGuard } from './../../src/auth/guards/jwt.guard'

describe('Auth Integration', () => {
  let app: INestApplication

  let controller: AuthController
  let service: AuthService
  let repository: Repository<User>
  let jwttAuthGuard: JwtAuthGuard

  let users: User[] = []
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({})],
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        LocalStrategy,
        JwtAuthGuard,
      ],
    }).compile()

    app = module.createNestApplication()

    controller = module.get<AuthController>(AuthController)
    service = module.get<AuthService>(AuthService)
    repository = module.get<Repository<User>>(getRepositoryToken(User))
    jwttAuthGuard = module.get<JwtAuthGuard>(JwtAuthGuard)
  })

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('controller should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('service should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('register', () => {
    beforeEach(() => {
      users = []
    })

    it('should be defined', () => {
      expect(controller.register).toBeDefined()
    })

    it('should register a user', async () => {
      app.init()
      const user = new User(null, 'Test User', 'test@gmail.com', 'Aa.123456')

      jest.spyOn(repository, 'findOne').mockResolvedValue(null)
      jest.spyOn(repository, 'save').mockImplementation((user: User) => {
        users.push(user)
        return Promise.resolve(user)
      })

      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: user.name,
          email: user.email,
          password: user.password,
        })
        .expect(201)
        .expect(({ body: userRegistered }) => {
          expect(userRegistered).toHaveProperty('id')
          expect(userRegistered.name).toBe(user.name)
          expect(userRegistered.email).toBe(user.email)
          expect(userRegistered).not.toHaveProperty('password')
        })
    })

    it('should throw a conflict exception when user already exists', async () => {
      const user = new User(3, 'Test User', 'test@gmail.com', 'Aa.123456')

      jest.spyOn(repository, 'findOne').mockResolvedValue(user)
      jest.spyOn(repository, 'save').mockImplementation((user: User) => {
        users.push(user)
        return Promise.resolve(user)
      })

      users.push(user)

      jest.spyOn(service, 'register')

      await expect(controller.register(user)).rejects.toThrow(ConflictException)
    })
  })

  describe('login', () => {
    beforeEach(() => {
      users = [new User(null, 'Test User', 'test@gmail.com', 'Aa.123456')]
    })

    afterEach(() => {
      jest.resetAllMocks()
    })

    it('should be defined', () => {
      expect(controller.login).toBeDefined()
    })

    it('should login a user', async () => {
      app.init()

      jest
        .spyOn(service, 'validateUser')
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .mockImplementation(async ({ email, password }: AuthDto) => {
          const user = users.find((item) => item.email === email)
          if (!user) return null
          return {
            id: 1,
            name: user.name,
            email: user.email,
            access_token: 'token',
          }
        })

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@gmail.com', password: 'Aa.123456' })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('access_token')
        })
        .finally(() => app.close())
    })
  })

  describe('updateUser', () => {
    beforeEach(() => {
      users = [new User(1, 'Test User', 'test@gmail.com', 'Aa.123456')]
    })

    afterEach(() => {
      jest.resetAllMocks()
      process.env.WITH_AUTH = 'true'
    })

    it('should be defined', () => {
      expect(controller.update).toBeDefined()
    })

    it('should update a user', async () => {
      process.env.WITH_AUTH = 'false'
      app.init()

      jest.spyOn(repository, 'findOne').mockResolvedValue(users[0])
      jest.spyOn(repository, 'save').mockImplementation((user: User) => {
        users[0] = user
        return Promise.resolve(user)
      })

      jest.spyOn(jwttAuthGuard, 'canActivate').mockImplementation((context) => {
        const req = context.switchToHttp().getRequest()
        req.user = {
          id: 1,
          username: 'testUser',
          email: 'test@gmail.com',
          jwt_token: 'token',
        }
        return true
      })

      return request(app.getHttpServer())
        .patch('/auth')
        .send({
          id: 1,
          name: 'New Name',
        })
        .set('Authorization', 'Bearer token')
        .expect(200)
        .then(({ body: jwtRes }) => {
          expect(jwtRes.name).toBe('New Name')
          expect(jwtRes).not.toHaveProperty('password')
        })
        .finally(() => app.close())
    })
  })
})
