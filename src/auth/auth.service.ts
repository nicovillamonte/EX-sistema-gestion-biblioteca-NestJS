import { HttpException, Injectable } from '@nestjs/common'
import { User } from './entities/user.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { AuthDto } from './dto/auth.dto'
import { JwtService } from '@nestjs/jwt'
import { UpdateUserDto, UserDto } from './dto/user.dto'
import { JWTToken } from './types/JWTToken.type'
import { testUser } from './../data/mock/testUserData.mock'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private authRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(user: User) {
    const userIsValid = await user.isValid()
    if (!userIsValid) throw new HttpException('Invalid user', 400)

    user.password = await bcrypt.hash(user.password, 12)

    const userExists = await this.authRepository.findOne({
      where: { email: user.email },
    })
    if (userExists) {
      throw new HttpException('User already exists', 409)
    }

    return this.authRepository.save(user)
  }

  async validateUser({ email, password }: AuthDto): Promise<JWTToken> {
    const user = await this.authRepository.findOne({
      where: { email },
    })

    if (!user) return null

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (isPasswordValid) {
      const { password, ...userResult } = user
      return {
        ...userResult,
        access_token: this.jwtService.sign(userResult),
      }
    }
  }

  async updateUser(userId: number, updateUserDto: UpdateUserDto) {
    let user = await this.authRepository.findOne({
      where: { id: userId },
    })

    if (!user) {
      throw new HttpException('User not found', 404)
    }

    user = Object.assign(user, updateUserDto)

    return this.authRepository.save(user)
  }

  deleteTestUser() {
    return this.authRepository.delete(testUser)
  }

  createTestUser() {
    return this.authRepository.save(testUser)
  }
}
