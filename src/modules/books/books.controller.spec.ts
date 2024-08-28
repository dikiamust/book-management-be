import { Test, TestingModule } from '@nestjs/testing';
import { BookService } from './books.service';
import { BookController } from './books.controller';
import { CreateBookDto, QueryBookList } from './dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('BookController', () => {
  let bookController: BookController;
  let bookService: BookService;
  const errorMessage = 'Something went wrong';
  const bookId = 'clztuw5l30000vk49e8kro229';
  const mockBook = {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    publishedYear: 1925,
    genres: ['Fiction', 'Classics'],
    stock: 10,
  };

  const mockUpdatedBook = {
    ...mockBook,
    title: 'The Great Gatsby - Updated',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookController],
      providers: [
        {
          provide: BookService,
          useValue: {
            create: jest.fn(),
            list: jest.fn(),
            detail: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    bookController = module.get<BookController>(BookController);
    bookService = module.get<BookService>(BookService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a book successfully', async () => {
      const dto: CreateBookDto = {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        publishedYear: 1925,
        genres: ['Fiction', 'Classics'],
        stock: 10,
      };

      jest.spyOn(bookService, 'create').mockResolvedValue(mockBook);

      const result = await bookController.create(dto);

      expect(result).toEqual(mockBook);
      expect(bookService.create).toHaveBeenCalledWith(dto);
    });

    it('should throw a BadRequestException on failure', async () => {
      const dto: CreateBookDto = {
        title: 'Invalid Book',
        author: 'Invalid Author',
        publishedYear: 9999,
        genres: ['Invalid Genre'],
        stock: 0,
      };

      jest
        .spyOn(bookService, 'create')
        .mockRejectedValue(new BadRequestException(errorMessage));

      try {
        await bookController.create(dto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe(errorMessage);
      }

      expect(bookService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('list', () => {
    it('should return a list of books', async () => {
      const query: QueryBookList = {
        page: 1,
        limit: 10,
      };

      jest.spyOn(bookService, 'list').mockResolvedValue({
        totalDatas: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        data: [
          {
            id: 'clztuw5l30000vk49e8kro229',
            ...mockBook,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          },
        ],
      });

      const result = await bookController.list(query);

      expect(result).toEqual({
        totalDatas: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        data: [
          {
            id: 'clztuw5l30000vk49e8kro229',
            ...mockBook,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          },
        ],
      });
      expect(bookService.list).toHaveBeenCalledWith(query);
    });

    it('should handle errors', async () => {
      const query: QueryBookList = {
        page: 1,
        limit: 10,
      };

      jest
        .spyOn(bookService, 'list')
        .mockRejectedValue(new Error(errorMessage));

      await expect(bookController.list(query)).rejects.toThrowError(
        errorMessage,
      );
      expect(bookService.list).toHaveBeenCalledWith(query);
    });
  });

  describe('detail', () => {
    it('should return book details for a valid bookId', async () => {
      jest.spyOn(bookService, 'detail').mockResolvedValue({
        id: 'clztuw5l30000vk49e8kro229',
        ...mockBook,
        deletedAt: null,
      } as any);

      const result = await bookController.detail(bookId);

      expect(result).toEqual({
        id: 'clztuw5l30000vk49e8kro229',
        ...mockBook,
        deletedAt: null,
      });
      expect(bookService.detail).toHaveBeenCalledWith(bookId);
    });

    it('should throw NotFoundException when the book does not exist', async () => {
      jest
        .spyOn(bookService, 'detail')
        .mockRejectedValueOnce(new NotFoundException('No Book found.'));

      await expect(bookController.detail('nonExistentBookId')).rejects.toThrow(
        NotFoundException,
      );

      expect(bookService.detail).toHaveBeenCalledWith('nonExistentBookId');
    });
  });

  describe('update', () => {
    it('should successfully update a book', async () => {
      const updateBookDto: CreateBookDto = {
        title: 'The Great Gatsby - Updated',
        author: 'F. Scott Fitzgerald',
        publishedYear: 1925,
        genres: ['Fiction', 'Classics'],
        stock: 10,
      };

      jest
        .spyOn(bookService, 'update')
        .mockResolvedValue(mockUpdatedBook as any);

      const result = await bookController.update(bookId, updateBookDto);

      expect(result).toEqual(mockUpdatedBook);
      expect(bookService.update).toHaveBeenCalledWith(bookId, updateBookDto);
    });

    it('should throw NotFoundException when the book does not exist', async () => {
      jest
        .spyOn(bookService, 'update')
        .mockRejectedValueOnce(new NotFoundException('No Book found.'));

      const updateBookDto: CreateBookDto = {
        title: 'The Great Gatsby - Updated',
        author: 'F. Scott Fitzgerald',
        publishedYear: 1925,
        genres: ['Fiction', 'Classics'],
        stock: 10,
      };

      await expect(
        bookController.update('nonExistentBookId', updateBookDto),
      ).rejects.toThrow(NotFoundException);
      expect(bookService.update).toHaveBeenCalledWith(
        'nonExistentBookId',
        updateBookDto,
      );
    });
  });

  describe('delete', () => {
    it('should successfully delete a book', async () => {
      jest
        .spyOn(bookService, 'delete')
        .mockResolvedValue({ message: 'Book deleted successfully' });

      const result = await bookController.delete(bookId);

      expect(result).toEqual({ message: 'Book deleted successfully' });
      expect(bookService.delete).toHaveBeenCalledWith(bookId);
    });

    it('should throw NotFoundException when the book does not exist', async () => {
      jest
        .spyOn(bookService, 'delete')
        .mockRejectedValueOnce(new NotFoundException('No Book found.'));

      await expect(bookController.delete(bookId)).rejects.toThrow(
        NotFoundException,
      );
      expect(bookService.delete).toHaveBeenCalledWith(bookId);
    });
  });
});
