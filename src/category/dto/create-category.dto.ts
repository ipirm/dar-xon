import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class CreateCategoryDto {

  @IsString()
  @ApiProperty({ example: "Фото/Видео", description: "Название Раздела", required: false })
  name: string;

  @ApiProperty({ example: "1", description: "Родитель id", required: false })
  parent: any;

  @ApiProperty({ example: "2", description: "Ребенок id", required: false })
  children: any;
}