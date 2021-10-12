import { IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class CreateReviewDto {

  @IsNumber()
  @ApiProperty({ example: 22, description: "İD задачи", required: false })
  task: any;

  @IsNumber()
  @ApiProperty({ example: 5, description: "Рейтинг", required: false })
  rating: number;

  @IsNumber()
  @ApiProperty({ example: 22, description: "Испонитель", required: false })
  executor: any;

  @IsString()
  @ApiProperty({ example: "Some text oveer here", description: "comment", required: false })
  comment: string;
}