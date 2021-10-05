import { IsDate, IsInt, isInt, IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class CreatePortfolioDto {

  @IsString()
  @ApiProperty({ example: "Заголовок", description: "Название задачи", required: false })
  title: string;

  @IsString()
  @ApiProperty({ example: "Описание", description: "Описание задачи", required: false })
  description: string;

  @IsString()
  @ApiProperty({ example: "Описание", description: "Описание задачи", required: false })
  company_name: string;

  @IsString()
  @ApiProperty({ example: "ссылка", description: "Ссылка на сайт", required: false })
  site: string;

  @IsDate()
  @Type(() => Date)
  @ApiProperty({ example: "2021-10-01T05:54:12.153Z", description: "Время окончания", required: false })
  finishedAt: Date;

  @IsString()
  @ApiProperty({ example: "5", description: "Категория/Раздел", required: false })
  category: any;
}