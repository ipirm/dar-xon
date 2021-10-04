import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsString } from "class-validator";


export class StartTaskDto {

  @IsArray()
  @ApiProperty({ example: [1,2,3], description: "Исполнитель", required: false })
  executors: any;

  @IsNumber()
  @ApiProperty({ example: 7, description: "Задача", required: true })
  task: any;

}