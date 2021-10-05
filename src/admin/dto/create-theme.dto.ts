import { IsEmail, IsString, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateThemeDto {

  @ApiProperty({ example: "ilham.pirm2@gmail.com", description: "Почта", required: true })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "Обращаюсь к вам по теме", description: "Тема", required: true })
  @IsString()
  theme: string;

  @ApiProperty({ example: "Какой то очень интересный текст", description: "Текст", required: true })
  @MaxLength(1500)
  @IsString()
  text: string;

}