import { ApiProperty, PartialType } from '@nestjs/swagger'
import {
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator'

export class UserDto {
  @ApiProperty({
    description: 'The id of the user',
    type: 'number',
    required: false,
    readOnly: true,
  })
  id?: number

  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
    type: 'string',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  name: string

  @ApiProperty({
    description: 'The email of the user',
    example: 'johndoe@gmail.com',
    type: 'string',
    required: true,
  })
  @IsEmail({}, { message: 'Invalid email' })
  @IsNotEmpty()
  email: string
}

export class UpdateUserDto {
  @ApiProperty({
    description: 'The id of the user to update',
    example: 1,
    required: true,
    type: 'number',
  })
  id: number

  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
    type: 'string',
    required: false, // Hacer explícito que esta propiedad es opcional para la actualización
  })
  @IsString()
  @MinLength(5)
  name?: string

  @ApiProperty({
    description: 'The email of the user',
    example: 'johndoe@gmail.com',
    type: 'string',
    required: false, // Hacer explícito que esta propiedad es opcional para la actualización
  })
  @IsEmail({}, { message: 'Invalid email' })
  email?: string
}
