import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const publishedYearErrMsg =
  'Please provide publishedYear in valid format, it must be exactly 4 digits, and must be between 1500 and 3000 like 1900';
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
  @IsInt({ message: publishedYearErrMsg })
  @Min(1500, {
    message: publishedYearErrMsg,
  })
  @Max(3000, {
    message: publishedYearErrMsg,
  })
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
