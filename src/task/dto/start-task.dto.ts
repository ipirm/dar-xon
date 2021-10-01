import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";


export class StartTaskDto {

  @IsNumber()
  @ApiProperty({ example: 10, description: "Исполнитель", required: false })
  executor: any;

  @IsNumber()
  @ApiProperty({ example: 7, description: "Задача", required: true })
  task: any;

}