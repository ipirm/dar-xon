import { IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class CreateCategoryDto {

  @IsString()
  @ApiProperty({ example: "Фото/Видео", description: "Название Раздела", required: false })
  name: string;

  @IsNumber()
  @ApiProperty({ example: "1", description: "Родитель id", required: false })
  parent: any;

}