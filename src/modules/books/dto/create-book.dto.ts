import { IsNotEmpty, IsString, IsInt, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookDto {
  @ApiProperty({
    example: 'The Great Gatsby',
    description: 'The title of the book',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'F. Scott Fitzgerald',
    description: 'The author of the book',
  })
  @IsNotEmpty()
  @IsString()
  author: string;

  @ApiProperty({
    example: 1925,
    description: 'The year the book was published',
  })
  @IsNotEmpty()
  @IsInt()
  publishedYear: number;

  @ApiProperty({
    example: ['Fiction', 'Classics'],
    description: 'The genres of the book',
    isArray: true,
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  genres: string[];

  @ApiProperty({
    example: 10,
    description: 'The stock available for the book',
  })
  @IsNotEmpty()
  @IsInt()
  stock: number;
}
