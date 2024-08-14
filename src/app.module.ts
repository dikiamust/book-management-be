import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BookModule } from './modules/books/books.module';
import { DatabaseModule } from './config/database/database.module';

@Module({
  imports: [DatabaseModule, BookModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
