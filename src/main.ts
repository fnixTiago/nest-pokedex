import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api/v2")

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform:true, //permiso para conversion string to int pagination
      transformOptions:{
        enableImplicitConversion:true,//permiso para conversion string to int pagination
      }
    })
  );
  await app.listen(process.env.PORT);
// console.log("Ejecutando en el port ", process.env.PORT);

}
bootstrap();
