import { IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class CreateTypeDto {

  @IsString()
  @ApiProperty({ example: "Копирайтинг", description: "Название Раздела", required: false })
  name: string;

  @IsNumber()
  @ApiProperty({ example: 14, description: "Родитель id", required: false })
  category: any;

}

