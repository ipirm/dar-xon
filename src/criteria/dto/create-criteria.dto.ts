import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class CreateCriteriaDto {

  @IsString()
  @ApiProperty({ example: "Размер", description: "Название", required: false })
  name: string;

}