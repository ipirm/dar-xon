import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api");
  const options = new DocumentBuilder()
    .setDescription("The  API description")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, options);


  app.enableCors();
  SwaggerModule.setup("api", app, document);
  const port = process.env.PORT || 3000;


  await app.listen(port, function() {
    console.log("Server started......." + port);
  });
}

bootstrap();
