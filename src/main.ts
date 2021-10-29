import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { config } from "aws-sdk";
import { ValidationPipe } from "@nestjs/common";
import { GoogleRecaptchaFilter } from "./filters/google.exception";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api");
  const options = new DocumentBuilder()
    .addBearerAuth()
    .setDescription("Дар APİ list")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, options);

  config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
  });
  app.useGlobalPipes(new ValidationPipe({
    forbidUnknownValues: true,
    skipMissingProperties: true,
    whitelist: true,
    forbidNonWhitelisted: true
  }));
  // app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors();
  // app.useGlobalFilters( new GoogleRecaptchaFilter())

  SwaggerModule.setup("api", app, document);
  const port = process.env.PORT || 3000;


  await app.listen(port, function() {
    console.log("Server started......." + port);
  });
}

bootstrap();
