import { IsDate, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


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

  @ApiProperty({
    example: 1,
    description: "Категория id нужно посылать самую нижнию по иерархие категоирию",
    required: true
  })
  category: any;

  @IsDate()
  @ApiProperty({ example: "2021-10-01T05:54:12.153Z", description: "Время окончания", required: false })
  finishedAt: Date;
}