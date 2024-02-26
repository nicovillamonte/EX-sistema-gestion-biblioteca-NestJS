import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { User } from './entities/user.entity'
import { getRepositoryToken } from '@nestjs/typeorm'
import { JwtModule } from '@nestjs/jwt'
import { testUser } from './../data/mock/testUserData.mock'
import {
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common'
import { LocalGuard } from './guards/local.guard'

describe('AuthController', () => {
  let service: AuthService
  let controller: AuthController

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'secret-test',
          signOptions: { expiresIn: '12h' },
        }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          name: 'AuthRepository',
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(LocalGuard)
      .useValue({ canActivate: () => true })
      .compile()

    service = module.get<AuthService>(AuthService)
    controller = module.get<AuthController>(AuthController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('register', () => {
    it('should register a user', async () => {
      const user = {
        name: testUser.name,
        email: testUser.email,
        password: testUser.password,
      }

      jest
        .spyOn(service, 'register')
        .mockResolvedValue(new User(1, user.name, user.email, user.password))

      const result = await controller.register(user)

      expect(result).toEqual(new User(1, user.name, user.email, user.password))
      expect(service.register).toHaveBeenCalled()
      expect(result).toBeInstanceOf(User)
    })

    it('should return an error if user mail already exists', async () => {
      const user = {
        name: testUser.name,
        email: testUser.email,
        password: testUser.password,
      }

      jest
        .spyOn(service, 'register')
        .mockRejectedValue(
          new HttpException('User already exists', HttpStatus.CONFLICT),
        )

      await expect(controller.register(user)).rejects.toThrow(HttpException)
    })
  })

  describe('login', () => {
    it('should return a user', async () => {
      const mockUser = { userId: 1, username: 'testUser' }
      const req = { user: mockUser }

      expect(await controller.login(req as any)).toBe(mockUser)
    })
  })

  describe('update', () => {
    it('should update a user', async () => {
      const user = {
        id: 1,
        name: testUser.name,
        email: testUser.email,
        password: testUser.password,
      }

      jest
        .spyOn(service, 'updateUser')
        .mockResolvedValue(new User(1, user.name, user.email, user.password))

      const result = await controller.update({ user } as any, user)

      expect(result).toEqual(new User(1, user.name, user.email, user.password))
      expect(service.updateUser).toHaveBeenCalled()
      expect(result).toBeInstanceOf(User)
    })

    it('should return an error if user does not exist', async () => {
      const user = {
        id: 1,
        name: testUser.name,
        email: testUser.email,
        password: testUser.password,
      }

      jest
        .spyOn(service, 'updateUser')
        .mockRejectedValue(
          new HttpException('User not found', HttpStatus.NOT_FOUND),
        )

      await expect(controller.update({ user } as any, user)).rejects.toThrow(
        HttpException,
      )
    })

    it('should return an error if user tries to update another user', async () => {
      const user = {
        id: 1,
        name: testUser.name,
        email: testUser.email,
        password: testUser.password,
      }

      jest.spyOn(service, 'updateUser').mockImplementation()

      await expect(
        controller.update({ user: { id: 2 } } as any, user),
      ).rejects.toThrow(UnauthorizedException)
    })
  })
})
