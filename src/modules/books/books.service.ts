import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/config/database/prisma.service';
import { CreateBookDto, QueryBookList } from './dto';
import { PaginationResponse } from 'src/common/pagination';
import { Prisma } from '@prisma/client';

@Injectable()
export class BookService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreateBookDto) {
    try {
      const newBook = await this.prismaService.book.create({
        data: dto,
      });

      const { title, author, publishedYear, genres, stock } = newBook;
      return { title, author, publishedYear, genres, stock };
    } catch (error) {
      throw new BadRequestException(error?.message || 'Something went wrong');
    }
  }

  async list(query: QueryBookList) {
    try {
      const skip = query?.limit
        ? Number(query.limit) * Number(query.page - 1)
        : undefined;
      const take = query?.limit ? Number(query.limit) : undefined;

      const where: Prisma.BookWhereInput = {
        deletedAt: null,
      };

      if (query?.search) {
        const searchCondition = {
          contains: query?.search,
          mode: Prisma.QueryMode.insensitive,
        };

        where.OR = [
          { title: searchCondition },
          { author: searchCondition },
          { genres: { hasSome: [query.search] } },
        ];
      }

      const book = await this.prismaService.book.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        where,
        skip,
        take,
      });

      const countBook = await this.prismaService.book.count({
        where,
      });

      return PaginationResponse(
        book,
        countBook,
        Number(query?.page || 0),
        Number(query?.limit || 0),
      );
    } catch (error) {
      throw new BadRequestException(error?.message || 'Something went wrong');
    }
  }

  private async detGetail(bookId: string) {
    try {
      return await this.prismaService.book.findFirstOrThrow({
        where: { id: bookId, deletedAt: null },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('No Book found.');
      }
      throw new BadRequestException(error?.message || 'Something went wrong');
    }
  }

  async detail(bookId: string) {
    try {
      const book = await this.detGetail(bookId);
      const { id, title, author, publishedYear, genres, stock } = book;
      return { id, title, author, publishedYear, genres, stock };
    } catch (error) {
      if (error?.status === 404) {
        throw new NotFoundException('No Book found.');
      }
      throw new BadRequestException(error?.message);
    }
  }

  async update(bookId: string, dto: CreateBookDto) {
    try {
      const book = await this.prismaService.book.update({
        where: { id: bookId, deletedAt: null },
        data: dto,
      });
      const { id, title, author, publishedYear, genres, stock } = book;
      return { id, title, author, publishedYear, genres, stock };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('No Book found.');
      }
      throw new BadRequestException(error?.message || 'Something went wrong');
    }
  }

  async delete(bookId: string) {
    try {
      const book = await this.prismaService.book.update({
        where: { id: bookId, deletedAt: null },
        data: { deletedAt: new Date() },
      });

      return { message: 'Book deleted successfully' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('No Book found.');
      }
      throw new BadRequestException(error?.message || 'Something went wrong');
    }
  }
}
