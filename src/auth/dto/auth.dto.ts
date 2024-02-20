import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator'
import { UserDto } from './user.dto'
import { Exclude } from 'class-transformer'

export class AuthDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'johndoe@gmail.com',
    type: 'string',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiProperty({
    description: 'The email of the user',
    example: 'Adkl%e23#jKakL34j&32jHn',
    type: 'string',
    required: true,
  })
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minSymbols: 1,
    minNumbers: 1,
  })
  @Exclude()
  password: string
}

export class RegisterDto extends UserDto {
  @ApiProperty({
    description: 'The password of the account',
    example: 'Adkl%e23#jKakL34j&32jHn',
    type: 'string',
    required: true,
  })
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minSymbols: 1,
    minNumbers: 1,
  })
  password: string
}
