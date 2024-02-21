import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpException,
} from '@nestjs/common'
import { LendingService } from './lending.service'
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard'
import { Request } from 'express'
import { AuthService } from './../auth/auth.service'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { User } from './../auth/entities/user.entity'
import { BookService } from './../book/book.service'

@Controller('lending')
@ApiBearerAuth()
@ApiTags('Lending')
export class LendingController {
  constructor(
    private readonly lendingService: LendingService,
    private readonly authService: AuthService,
    private readonly bookService: BookService,
  ) {}

  @Post(':bookISBN')
  @ApiOperation({ summary: 'Lend a book' })
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: Request, @Param('bookISBN') isbn: string) {
    console.info('req.user', req.user)
    let { id: userId } = req.user as User
    const user = await this.authService.findOne(userId)

    if (!user) {
      throw new HttpException('User not found', 404)
    }

    const book = await this.bookService.search(isbn)

    if (book.length === 0) {
      throw new HttpException('Book not found', 404)
    }

    return this.lendingService.lendBook(user, book[0])
  }
}
