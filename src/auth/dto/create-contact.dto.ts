import { IsEmail, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateContactDto {

  @ApiProperty({ example: "ilham.pirm2@gmail.com", description: "Почта", required: false })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "Пираммемедов Ильхам", description: "Фио", required: false })
  @IsString()
  fio: string;

  @ApiProperty({ example: "Классная тема", description: "Тема", required: false })
  @IsString()
  theme: string;

  @ApiProperty({ example: "Какой то текст написан тут", description: "Текст", required: false })
  @IsString()
  text: string;

  @IsOptional()
  @ApiProperty({ type: "array", items: { type: "string", format: "binary" }, required: false })
  files?: any[];

}