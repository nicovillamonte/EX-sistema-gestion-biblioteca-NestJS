import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { BookService } from './book.service'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { BookDto, UpdateBookDto } from './dto/book.dto'
import { Book } from './entities/book.entity'
import { JwtAuthGuard } from './../auth/guards/jwt.guard'

@Controller('book')
@ApiBearerAuth()
@ApiTags('Books')
@UseGuards(JwtAuthGuard)
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  @ApiOperation({ summary: 'Create a book.' })
  @ApiResponse({
    status: 201,
    description: 'The book was created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid book',
  })
  @ApiResponse({
    status: 409,
    description: 'Book already exists',
  })
  @ApiBody({ type: BookDto })
  async create(@Body() createBookDto: BookDto) {
    const book = Book.fromDto(createBookDto)
    return this.bookService.create(book, createBookDto.authors)
  }

  @Get('search/:query')
  @ApiOperation({ summary: 'Search for books by title, author or ISBN.' })
  @ApiResponse({
    status: 200,
    description: 'The books were retrieved successfully',
  })
  search(@Param('query') query: string) {
    return this.bookService.search(query)
  }

  @Patch(':isbn')
  @ApiOperation({ summary: 'Update a book by ISBN.' })
  @ApiResponse({
    status: 200,
    description: 'The book was updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Book not found',
  })
  @ApiBody({ type: UpdateBookDto })
  async update(
    @Param('isbn') isbn: string,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    const bookToUpdate = (await this.bookService.search(isbn))[0]
    if (!bookToUpdate) {
      throw new NotFoundException('Book not found')
    }
    if (updateBookDto.ISBN && updateBookDto.ISBN !== isbn) {
      throw new BadRequestException(
        'ISBN cannot be updated. Please delete and create a new book.',
      )
    }

    return this.bookService.update(bookToUpdate, updateBookDto)
  }

  @Delete(':isbn')
  @ApiOperation({ summary: 'Delete a book by ISBN.' })
  @ApiResponse({
    status: 200,
    description: 'The book was deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Book not found',
  })
  async remove(@Param('isbn') isbn: string) {
    const book = (await this.bookService.search(isbn))[0]

    if (!book) {
      throw new NotFoundException('Book not found')
    }

    return this.bookService.remove(book)
  }
}
