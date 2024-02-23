import { ApiProperty } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsISBN, IsNumber, IsNumberString, IsOptional } from 'class-validator'
import { IsValidDate } from './../../utils/validators/isValidDate.validator'

export class LendingDto {
  @ApiProperty({
    description: 'The id of the lending',
    type: 'number',
    required: false,
    readOnly: true,
  })
  @IsNumberString(
    {
      no_symbols: true,
    },
    {
      message: 'Lending ID must be a number.',
    },
  )
  @IsOptional()
  lendingId?: number

  @ApiProperty({
    description: 'The id of the user',
    type: 'number',
    required: true,
    example: 1,
  })
  @IsNumber(undefined, {
    message: 'User ID must be a number.',
  })
  userId: number

  @ApiProperty({
    description: 'The ISBN of the book',
    type: 'string',
    required: true,
    example: '978-0-13-235088-4',
  })
  @IsISBN(undefined, {
    message: 'ISBN must be a valid 10 or 13 characters ISBN.',
  })
  bookISBN: string

  @ApiProperty({
    description: 'The borrow date',
    required: true,
    default: new Date().toISOString(),
  })
  @IsValidDate({
    message: 'Borrow date must be a valid date.',
  })
  @Type(() => Date)
  // @MinDate(new Date())
  @Transform(({ value }) => new Date(value))
  borrowDate: Date

  @IsValidDate({
    message: 'Return date must be a valid date.',
  })
  @Type(() => Date)
  @IsOptional()
  returnDate?: Date
}
