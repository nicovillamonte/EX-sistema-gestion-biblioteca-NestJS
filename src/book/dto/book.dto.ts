import { ApiAcceptedResponse, ApiProperty, PartialType } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsISBN,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator'
import { Author } from '../../author/entities/author.entity'

export class BookDto {
  @ApiProperty({
    description: 'ISBN of the book (PK)',
    uniqueItems: true,
    example: '9780132350884',
    format: 'ISBN',
  })
  @IsISBN()
  ISBN: string

  @ApiProperty({
    description: 'Title of the book',
    example: 'Clean Code',
  })
  @IsNotEmpty()
  title: string

  @ApiProperty({
    description: 'Author or authors of the book',
    example: [
      {
        name: 'Robert C. Martin',
      },
    ],
  })
  @IsArray()
  authors: Author[]

  @ApiProperty({
    description:
      'Number of copies of the book in the library available for borrowing',
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity?: number
}

export class UpdateBookDto extends PartialType(BookDto) {}
