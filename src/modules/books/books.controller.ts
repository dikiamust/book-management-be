import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BookService } from './books.service';
import { CreateBookDto } from './dto';
import { create } from './example-response';

@ApiTags('Book')
@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @ApiOperation({
    description: `Craete a book`,
  })
  @ApiOkResponse({
    description: 'Success Response',
    content: {
      'application/json': {
        example: create,
      },
    },
  })
  @Post()
  create(@Body() dto: CreateBookDto) {
    return this.bookService.create(dto);
  }

  @ApiOperation({
    description: `Get detail a book`,
  })
  @ApiOkResponse({
    description: 'Success Response',
    content: {
      'application/json': {
        example: create,
      },
    },
  })
  @Get(':bookId')
  detail(@Param('bookId') bookId: string) {
    return this.bookService.detail(bookId);
  }

  @ApiOperation({
    description: `Update a book`,
  })
  @ApiOkResponse({
    description: 'Success Response',
    content: {
      'application/json': {
        example: create,
      },
    },
  })
  @Put(':bookId')
  update(@Param('bookId') bookId: string, @Body() dto: CreateBookDto) {
    return this.bookService.update(bookId, dto);
  }

  @ApiOperation({
    description: `Delete a book`,
  })
  @ApiOkResponse({
    description: 'Success Response',
    content: {
      'application/json': {
        example: { message: 'Book deleted successfully' },
      },
    },
  })
  @Delete(':bookId')
  delete(@Param('bookId') bookId: string) {
    return this.bookService.delete(bookId);
  }
}
