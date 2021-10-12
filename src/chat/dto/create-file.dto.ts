import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class CreateFileDto {
  @IsOptional()
  @ApiProperty({ type: "string", format: "binary", description: "Файл" })
  file: any;
}