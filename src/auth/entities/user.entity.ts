import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MinLength,
  validate,
} from 'class-validator'
import { UserDto } from '../dto/user.dto'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { RegisterDto } from '../dto/auth.dto'
import { Exclude, instanceToPlain, plainToInstance } from 'class-transformer'
import { Book } from './../../book/entities/book.entity'
import { Lending } from './../../lending/entities/lending.entity'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({
    type: 'varchar',
    length: 30,
  })
  @IsNotEmpty({ message: "Name can't be empty" })
  @IsString({ message: 'Name must be a string' })
  @MinLength(5)
  name: string

  @Column({
    type: 'varchar',
    length: 50,
  })
  @IsEmail(undefined, { message: 'Invalid email' })
  @IsNotEmpty({ message: "Email can't be empty" })
  email: string

  @Column({
    type: 'varchar',
    length: 100,
  })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1,
      minNumbers: 1,
    },
    { message: 'Password is too weak' },
  )
  @IsNotEmpty()
  @Exclude()
  password: string

  constructor(
    id: number = null,
    name: string,
    email: string,
    password?: string,
  ) {
    this.id = id
    this.name = name
    this.email = email
    this.password = password
  }

  static fromDto(dto: RegisterDto): User {
    return new User(dto.id, dto.name, dto.email, dto.password)
  }

  static fromDtoWithoutPassword(dto: UserDto): User {
    return new User(dto.id, dto.name, dto.email)
  }

  toDto(): any {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
    }
  }

  async isValid(): Promise<boolean> {
    const errors = await validate(this)
    return errors.length === 0
  }

  takeABook(book: Book): Lending {
    const lending = book.borrowTo(this)

    let lendingPlain = instanceToPlain(lending)
    delete lendingPlain.book.quantity
    let lendingModified = plainToInstance(Lending, lendingPlain)
    return lendingModified
  }

  returnBook(book: Book) {
    book.return()
  }
}
