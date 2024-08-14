import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/pagination';

export class QueryBookList extends PaginationDto {
  @ApiProperty({
    description: 'Search feature',
    example: 'The Great Gatsby',
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;
}
