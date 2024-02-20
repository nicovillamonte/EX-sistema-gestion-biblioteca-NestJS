import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Author } from './entities/author.entity'
import { Repository } from 'typeorm'

@Injectable()
export class AuthorService {
  constructor(
    @InjectRepository(Author)
    protected readonly authorRepository: Repository<Author>,
  ) {}

  findByName(name: string) {
    return this.authorRepository.findOne({
      where: {
        name,
      },
    })
  }

  create(authorName: string): Promise<Author> {
    const author = new Author(authorName)
    return this.authorRepository.save(author)
  }
}
