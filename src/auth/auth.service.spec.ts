import { Repository } from 'typeorm'
import { AuthService } from './auth.service'
import { User } from './entities/user.entity'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { JwtService } from '@nestjs/jwt'
import { HttpException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'

jest.mock('bcrypt', () => ({
  ...jest.requireActual('bcrypt'),
  compare: jest.fn().mockResolvedValue(true),
}))

describe('AuthService', () => {
  let service: AuthService
  let repository: Repository<User>
  let jwtService: JwtService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        JwtService,
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    repository = module.get<Repository<User>>(getRepositoryToken(User))

    jwtService = module.get<JwtService>(JwtService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('register', () => {
    it('should register a user', async () => {
      const user = new User(
        1,
        'testingUser',
        'test@gmail.com',
        'Ad.se#jkJK#123',
      )

      jest.spyOn(repository, 'findOne').mockResolvedValue(null)
      jest.spyOn(repository, 'save').mockResolvedValue(user)

      const result = await service.register(user)

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: user.email },
      })
      expect(repository.save).toHaveBeenCalledWith(user)
      expect(result).toEqual(user)
    })

    it('should throw an error if user already exists', async () => {
      const user = new User(
        1,
        'testingUser',
        'test@gmail.com',
        'Ad.se#jkJK#123',
      )

      jest.spyOn(repository, 'findOne').mockResolvedValue(user)

      await expect(service.register(user)).rejects.toThrow(HttpException)
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: user.email },
      })
    })

    it('should throw an error if user is invalid', async () => {
      const user = new User(1, 'testingUser', 'testmail.com', 'Ad.se#jkJK#123')

      await expect(service.register(user)).rejects.toThrow(HttpException)
    })
  })

  describe('validateUser', () => {
    it('should validate a user', async () => {
      const user = new User(
        1,
        'testingUser',
        'test@gmail.com',
        'Ad.se#jkJK#123',
      )

      const jwtToken = {
        access_token: 'token',
      }

      jest.spyOn(repository, 'findOne').mockResolvedValue(user)
      jest.spyOn(repository, 'save').mockResolvedValue(user)
      jest.spyOn(jwtService, 'sign').mockReturnValue(jwtToken.access_token)

      const result = await service.validateUser({
        email: user.email,
        password: user.password,
      })

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email: user.email },
      })
      expect(bcrypt.compare).toHaveBeenCalledWith(
        user.password,
        expect.any(String),
      )
      expect(jwtService.sign).toHaveBeenCalled()

      const { password, ...userWithoutPassword } = user
      expect(result).toEqual({ ...jwtToken, ...userWithoutPassword })
    })

    it('should return null if user does not exist', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null)

      const result = await service.validateUser({
        email: 'noexist@gmail.com',
        password: 'Ad.se#jkJK#123',
      })

      expect(result).toBeNull()
    })

    it('should return null if password is invalid', async () => {
      const user = new User(
        1,
        'testingUser',
        'test@gmail.com',
        'Ad.se#jkJK#123',
      )

      jest.spyOn(repository, 'findOne').mockResolvedValue(user)
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => false)

      const result = await service.validateUser({
        email: user.email,
        password: 'wrongpassword',
      })
    })
  })

  describe('updateUser', () => {
    it('should update a user', async () => {
      const user = new User(
        1,
        'testingUser',
        'test@gmail.com',
        'Ad.se#jkJK#123',
      )

      const updateUserDto = {
        name: 'updatedName',
      }

      jest.spyOn(repository, 'findOne').mockResolvedValue(user)
      jest.spyOn(repository, 'save').mockResolvedValue(user)

      const result = await service.updateUser(user.id, {
        id: user.id,
        ...updateUserDto,
      })

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: user.id },
      })
      expect(repository.save).toHaveBeenCalledWith(user)
      expect(result).toEqual(user)
    })

    it('should throw an error if user does not exist', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null)

      await expect(
        service.updateUser(1, {
          id: 1,
          name: 'updatedName',
        }),
      ).rejects.toThrow(HttpException)
    })
  })
})
