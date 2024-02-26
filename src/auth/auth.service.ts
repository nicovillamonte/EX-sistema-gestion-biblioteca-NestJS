import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { User } from './entities/user.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { AuthDto } from './dto/auth.dto'
import { JwtService } from '@nestjs/jwt'
import { UpdateUserDto } from './dto/user.dto'
import { JWTToken } from './types/JWTToken.type'
import { testUser } from './../data/mock/testUserData.mock'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private authRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  findOne(id: number) {
    return this.authRepository.findOne({
      where: { id },
    })
  }

  async register(user: User) {
    const userIsValid = await user.isValid()
    if (!userIsValid) throw new BadRequestException('Invalid user')

    user.password = await bcrypt.hash(user.password, 12)

    const userExists = await this.authRepository.findOne({
      where: { email: user.email },
    })
    if (userExists) {
      throw new ConflictException('User already exists')
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userResult } = user
      return {
        ...userResult,
        access_token: this.jwtService.sign(userResult),
      }
    }

    return null
  }

  async updateUser(userId: number, updateUserDto: UpdateUserDto) {
    let user = await this.authRepository.findOne({
      where: { id: userId },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    user = Object.assign(user, updateUserDto)

    return this.authRepository.save(user)
  }

  deleteTestUser() {
    return this.authRepository.delete({ email: testUser.email })
  }

  createTestUser() {
    return this.register(
      new User(null, testUser.name, testUser.email, testUser.password),
    )
  }
}
