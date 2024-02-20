import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { Book } from './entities/book.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { ILike, Repository } from 'typeorm'
import { AuthorService } from './../author/author.service'
import { Author } from './../author/entities/author.entity'
import { UpdateBookDto } from './dto/book.dto'

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book) protected readonly bookRepository: Repository<Book>,
    private readonly authorService: AuthorService,
  ) {}

  async create(
    book: Book,
    authors: {
      name: string
    }[],
  ): Promise<Book> {
    let author: Author
    if (!(await book.isValid())) {
      throw new HttpException('Invalid book', HttpStatus.BAD_REQUEST)
    }

    // Check if book already exists
    const bookExists = await this.bookRepository.findOne({
      where: { ISBN: book.ISBN },
    })
    if (bookExists)
      throw new HttpException('Book already exists', HttpStatus.CONFLICT)

    book.authors = await Promise.all(
      authors.map(async (_author) => {
        author = await this.authorService.findByName(_author.name)
        if (!author) {
          author = await this.authorService.create(_author.name)
        }

        return Author.fromDto(author)
      }),
    )

    return this.bookRepository.save(book)
  }

  search(query: string) {
    return this.bookRepository.find({
      where: [
        { title: ILike(`%${query}%`) },
        { ISBN: query },
        { authors: { name: ILike(`%${query}%`) } },
      ],
      relations: ['authors'],
    })
  }

  async update(book: Book, updateBookDto: UpdateBookDto) {
    book = Object.assign(book, updateBookDto)

    if (updateBookDto.authors && updateBookDto.authors.length > 0) {
      const updatedAuthors = await Promise.all(
        updateBookDto.authors.map(async (authorDto) => {
          let author = await this.authorService.findByName(authorDto.name)
          if (!author) {
            author = await this.authorService.create(authorDto.name)
          }
          return author
        }),
      )
      book.authors = updatedAuthors
    }

    return this.bookRepository.save(book)
  }

  async remove(book: Book) {
    await this.bookRepository.remove(book)
  }
}
