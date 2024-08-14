import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/config/database/prisma.service';
import { BookService } from './books.service';
import { CreateBookDto, QueryBookList } from './dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PaginationResponse } from 'src/common/pagination';

describe('BookService', () => {
  let service: BookService;
  let prismaService: PrismaService;
  const errorMessage = 'Something went wrong';
  const error = {
    code: 'P2025',
  };
  const bookId = 'clztuw5l30000vk49e8kro229';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookService,
        {
          provide: PrismaService,
          useValue: {
            book: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              findFirstOrThrow: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<BookService>(BookService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a book', async () => {
      const dto: CreateBookDto = {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        publishedYear: 1925,
        genres: ['Fiction', 'Classics'],
        stock: 10,
      };

      const mockBook = dto;

      jest
        .spyOn(prismaService.book, 'create')
        .mockResolvedValue(mockBook as any);

      const result = await service.create(dto);

      expect(result).toEqual(mockBook);
      expect(prismaService.book.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException on failure', async () => {
      const dto: CreateBookDto = {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        publishedYear: 1925,
        genres: ['Fiction', 'Classics'],
        stock: 10,
      };

      jest
        .spyOn(prismaService.book, 'create')
        .mockRejectedValue(new Error(errorMessage));

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow(errorMessage);
      expect(prismaService.book.create).toHaveBeenCalledWith({ data: dto });
    });
  });

  describe('list', () => {
    it('should return paginated book list successfully', async () => {
      const query: QueryBookList = {
        page: 1,
        limit: 10,
        search: 'Great Gatsby',
      };

      const books = [
        {
          id: 'clztuw5l30000vk49e8kro229',
          title: 'The Great Gatsby',
          author: 'F. Scott Fitzgerald',
          publishedYear: 1925,
          genres: ['Fiction', 'Classics'],
          stock: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];

      const totalBooks = 1;

      jest.spyOn(prismaService.book, 'findMany').mockResolvedValue(books);
      jest.spyOn(prismaService.book, 'count').mockResolvedValue(totalBooks);

      const result = await service.list(query);

      expect(result).toEqual(
        PaginationResponse(
          books,
          totalBooks,
          Number(query.page),
          Number(query.limit),
        ),
      );
      expect(prismaService.book.findMany).toHaveBeenCalledWith({
        orderBy: {
          createdAt: 'desc',
        },
        where: {
          deletedAt: null,
          OR: [
            { title: { contains: query.search, mode: 'insensitive' } },
            { author: { contains: query.search, mode: 'insensitive' } },
            { genres: { hasSome: [query.search] } },
          ],
        },
        skip: 0,
        take: 10,
      });
      expect(prismaService.book.count).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
          OR: [
            { title: { contains: query.search, mode: 'insensitive' } },
            { author: { contains: query.search, mode: 'insensitive' } },
            { genres: { hasSome: [query.search] } },
          ],
        },
      });
    });

    it('should throw BadRequestException when an error occurs', async () => {
      const query: QueryBookList = { page: 1, limit: 10 };

      const error = new Error(errorMessage);

      jest.spyOn(prismaService.book, 'findMany').mockRejectedValue(error);

      await expect(service.list(query)).rejects.toThrow(BadRequestException);
      await expect(service.list(query)).rejects.toThrow(errorMessage);
    });
  });

  describe('getGetail', () => {
    it('should return book details successfully', async () => {
      const mockBook = {
        id: bookId,
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        publishedYear: 1925,
        genres: ['Fiction', 'Classics'],
        stock: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      jest
        .spyOn(prismaService.book, 'findFirstOrThrow')
        .mockResolvedValue(mockBook);

      const result = await (service as any).getGetail(bookId);

      expect(result).toEqual(mockBook);
      expect(prismaService.book.findFirstOrThrow).toHaveBeenCalledWith({
        where: { id: bookId, deletedAt: null },
      });
    });

    it('should throw NotFoundException when no book is found', async () => {
      jest
        .spyOn(prismaService.book, 'findFirstOrThrow')
        .mockRejectedValue(error);

      await expect((service as any).getGetail(bookId)).rejects.toThrow(
        NotFoundException,
      );
      await expect((service as any).getGetail(bookId)).rejects.toThrow(
        'No Book found.',
      );
    });

    it('should throw BadRequestException for other errors', async () => {
      const error = new Error(errorMessage);

      jest
        .spyOn(prismaService.book, 'findFirstOrThrow')
        .mockRejectedValue(error);

      await expect((service as any).getGetail(bookId)).rejects.toThrow(
        BadRequestException,
      );
      await expect((service as any).getGetail(bookId)).rejects.toThrow(
        errorMessage,
      );
    });
  });

  describe('update', () => {
    it('should update a book successfully', async () => {
      const dto: CreateBookDto = {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        publishedYear: 1925,
        genres: ['Fiction', 'Classics'],
        stock: 10,
      };

      const updatedBook = {
        id: bookId,
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      jest.spyOn(prismaService.book, 'update').mockResolvedValue(updatedBook);

      const result = await service.update(bookId, dto);

      expect(result).toEqual({
        id: bookId,
        title: dto.title,
        author: dto.author,
        publishedYear: dto.publishedYear,
        genres: dto.genres,
        stock: dto.stock,
      });
      expect(prismaService.book.update).toHaveBeenCalledWith({
        where: { id: bookId, deletedAt: null },
        data: dto,
      });
    });

    it('should throw NotFoundException when no book is found', async () => {
      jest.spyOn(prismaService.book, 'update').mockRejectedValue(error);

      await expect(service.update(bookId, {} as CreateBookDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(bookId, {} as CreateBookDto)).rejects.toThrow(
        'No Book found.',
      );
    });
  });

  describe('delete', () => {
    it('should delete a book successfully', async () => {
      const updatedBook = {
        id: bookId,
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        publishedYear: 1925,
        genres: ['Fiction', 'Classics'],
        stock: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: new Date(),
      };

      jest.spyOn(prismaService.book, 'update').mockResolvedValue(updatedBook);

      const result = await service.delete(bookId);

      expect(result).toEqual({ message: 'Book deleted successfully' });
      expect(prismaService.book.update).toHaveBeenCalledWith({
        where: { id: bookId, deletedAt: null },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should throw NotFoundException when no book is found', async () => {
      jest.spyOn(prismaService.book, 'update').mockRejectedValue(error);

      await expect(service.delete(bookId)).rejects.toThrow(NotFoundException);
      await expect(service.delete(bookId)).rejects.toThrow('No Book found.');
    });
  });

  describe('detail', () => {
    it('should return book details successfully', async () => {
      const mockBook = {
        id: bookId,
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        publishedYear: 1925,
        genres: ['Fiction', 'Classics'],
        stock: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      jest.spyOn(service as any, 'getGetail').mockResolvedValue(mockBook);

      const result = await service.detail(bookId);

      expect(result).toEqual({
        id: bookId,
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        publishedYear: 1925,
        genres: ['Fiction', 'Classics'],
        stock: 10,
      });
      expect((service as any).getGetail).toHaveBeenCalledWith(bookId);
    });

    it('should throw NotFoundException when no book is found', async () => {
      const error = { status: 404 };

      jest.spyOn(service as any, 'getGetail').mockRejectedValue(error);

      await expect(service.detail(bookId)).rejects.toThrow(NotFoundException);
      await expect(service.detail(bookId)).rejects.toThrow('No Book found.');
    });
  });
});
