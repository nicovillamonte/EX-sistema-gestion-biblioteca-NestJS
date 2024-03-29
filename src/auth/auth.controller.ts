import {
  Controller,
  Post,
  Body,
  Patch,
  UseGuards,
  Req,
  UnauthorizedException,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthDto, RegisterDto } from './dto/auth.dto'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'
import { User } from './entities/user.entity'
import { LocalGuard } from './guards/local.guard'
import { Request } from 'express'
import { JwtAuthGuard } from './guards/jwt.guard'
import { UpdateUserDto } from './dto/user.dto'

@Controller('auth')
@ApiTags('Authentication')
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @UseInterceptors(ClassSerializerInterceptor)
  register(@Body() createUserDto: RegisterDto): Promise<User> {
    const user = User.fromDto(createUserDto)
    return this.authService.register(user)
  }

  @Post('login')
  @UseGuards(LocalGuard)
  @ApiOperation({ summary: 'Login a user' })
  @ApiBody({ type: AuthDto })
  login(@Req() req: Request) {
    return req.user
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user information' })
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBody({
    type: UpdateUserDto,
  })
  async update(
    @Req() req: Request,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user: User = req.user as User

    if (updateUserDto.id !== user.id) {
      throw new UnauthorizedException(
        'You cannot update information of another user.',
      )
    }

    return this.authService.updateUser(user.id, updateUserDto)
  }
}
