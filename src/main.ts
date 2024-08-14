import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger as LoggerNest, ValidationPipe } from '@nestjs/common';
import { initSwagger } from './config/api-doc/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const isShowSwagger = process.env.SWAGGER_SHOW_API_SPEC === 'true';
  if (isShowSwagger) {
    initSwagger(app);
  }

  const port = process.env.PORT;
  await app.listen(port);

  const logger = new LoggerNest('bootstrap');
  logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
