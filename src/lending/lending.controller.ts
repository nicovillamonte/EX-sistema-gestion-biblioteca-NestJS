import {
  Controller,
  Post,
  Param,
  UseGuards,
  Req,
  Get,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common'
import { LendingService } from './lending.service'
import { Request } from 'express'
import { AuthService } from './../auth/auth.service'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { User } from './../auth/entities/user.entity'
import { BookService } from './../book/book.service'
import { JwtAuthGuard } from './../auth/guards/jwt.guard'

@Controller('lending')
@ApiBearerAuth()
@ApiTags('Lending')
export class LendingController {
  constructor(
    private readonly lendingService: LendingService,
    private readonly authService: AuthService,
    private readonly bookService: BookService,
  ) {}

  @Post('return/:lendingID')
  @ApiOperation({ summary: 'Return a book' })
  @UseGuards(JwtAuthGuard)
  async return(@Req() req: Request, @Param('lendingID') lendingID: number) {
    const { id: userId } = req.user as User
    const user = await this.authService.findOne(userId)
    if (!user) throw new NotFoundException('User not found')

    const lending = await this.lendingService.findOne(lendingID)
    if (!lending) throw new NotFoundException('Lending not found')
    if (lending.returnDate) throw new ConflictException('Book already returned')

    if (lending.user.id !== user.id)
      throw new ForbiddenException('User not allowed to return this book')

    return this.lendingService.returnBook(lending)
  }

  @Post(':bookISBN')
  @ApiOperation({ summary: 'Lend a book' })
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: Request, @Param('bookISBN') isbn: string) {
    const { id: userId } = req.user as User
    const user = await this.authService.findOne(userId)

    if (!user) {
      throw new NotFoundException('User not found')
    }

    const book = await this.bookService.search(isbn)

    if (book.length === 0) {
      throw new NotFoundException('Book not found')
    }

    return this.lendingService.lendBook(user, book[0])
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get user lending history' })
  async history(@Param('userId') userId: number) {
    const user = await this.authService.findOne(userId)

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return this.lendingService.findUserLendingHistory(user)
  }
}
