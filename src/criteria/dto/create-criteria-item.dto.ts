import { IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class CreateCriteriaItemDto {

  @IsString()
  @ApiProperty({ example: "Большой", description: "Название", required: false })
  name: string;

  @IsNumber()
  @ApiProperty({ example: 1, description: "Критерия id", required: false })
  criteria: any;
}