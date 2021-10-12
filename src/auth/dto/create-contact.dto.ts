import { IsEmail, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateContactDto {

  @ApiProperty({ example: "ilham.pirm2@gmail.com", description: "Почта, Хардкод-смс: 123456", required: false })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "Пираммемедов Ильхам", description: "фио", required: false })
  @IsString()
  fio: string;

  @ApiProperty({ example: "Классная тема", description: "Тема", required: false })
  @IsString()
  theme: string;

  @ApiProperty({ example: "Какой то текст написан тут", description: "Текст", required: false })
  @IsString()
  text: string;

  @ApiProperty({ type: "array", items: { type: "string", format: "binary" }, required: false })
  files?: any[];
}