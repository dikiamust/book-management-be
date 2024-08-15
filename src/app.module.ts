import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BookModule } from './modules/books/books.module';
import { DatabaseModule } from './config/database/database.module';
import { LoggerMiddleware } from './middlewares';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    DatabaseModule,
    BookModule,
    CacheModule.register({
      ttl: 5 * 1000, // time to live (TTL) in seconds (5 seconds)
      max: 10, // the maximum number of items to store in cache memory
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
