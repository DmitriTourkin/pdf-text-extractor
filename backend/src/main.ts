import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { FRONTEND_ORIGIN } from './common/constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser())
  app.enableCors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
