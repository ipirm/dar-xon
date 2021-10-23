import { IsDate, IsOptional, IsString } from "class-validator";
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

  @IsString()
  @ApiProperty({ example: true, description: "Спонсоры", default: "false", required: false })
  sponsors: boolean;

  @IsDate()
  @Type(() => Date)
  @ApiProperty({ example: "2021-10-01T05:54:12.153Z", description: "Время окончания", required: false })
  finishedAt: Date;

  @IsString()
  @ApiProperty({ example: "14", description: "Категория/Раздел", required: false })
  category: any;

  @IsString()
  @ApiProperty({ example: "1", description: "Категория/Раздел", required: false })
  cat_type: any;

  @IsOptional()
  @ApiProperty({ type: "array", items: { type: "string", format: "binary", description: "Файлы" }, required: false })
  files?: any[];

  @IsOptional()
  @ApiProperty({ type: "string", format: "binary", description: "Логотип Заказчика", required: false  })
  logo: any;

  @IsOptional()
  @ApiProperty({ type: "string", format: "binary", description: "Обложка Портфолио", required: false  })
  image: any;
}
