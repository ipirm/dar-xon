import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";


export class FinishTaskDto {

  @IsNumber()
  @ApiProperty({ example: 7, description: "Задача", required: true })
  task: any;

}