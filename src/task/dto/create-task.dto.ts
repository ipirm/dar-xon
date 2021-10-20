import { IsDate, IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class CreateTaskDto {

  @IsString()
  @ApiProperty({ example: "Заголовок", description: "Название задачи", required: false })
  title: string;

  @IsString()
  @ApiProperty({ example: "Описание", description: "Описание задачи", required: false })
  description: string;

  @IsString()
  @ApiProperty({ example: "ссылка", description: "Ссылка на сайт", required: false })
  site: string;

  @IsString()
  @ApiProperty({
    example: 1,
    description: "Категория id нужно посылать самую нижнию по иерархие категоирию",
    required: true
  })
  category: any;

  @IsString()
  @ApiProperty({
    example: 1,
    description: "Тип задачи",
    required: true
  })
  task_type: any;

  @IsDate()
  @Type(() => Date)
  @ApiProperty({ example: "2021-10-01T05:54:12.153Z", description: "Время окончания", required: false })
  finishedAt: Date;

  @IsString()
  @ApiProperty({ example: 4, description: "Количество исполнителей", required: false })
  participants: number;

  @ApiProperty({ type: "array", items: { type: "string", format: "binary" }, required: false })
  files?: any[];

  @IsString()
  @ApiProperty({ example: "2", description: "İd выбранных критериев", required: false })
  criteria: any;
}