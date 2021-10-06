import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class CreateExecutorDto {

  @IsString()
  @ApiProperty({ example: "Ильхам Пирмаммадов,Вугар", description: "ФИО", required: false })
  fio: string;

  @IsString()
  @ApiProperty({ example: "w33haa", description: "login", required: false })
  login: string;

  @IsString()
  @ApiProperty({ example: "+7945642223", description: "Номер телефона", required: true })
  phone: string;

  @IsString()
  @ApiProperty({ example: "password112", description: "Пароль", required: false })
  password: string;

  @IsString()
  @ApiProperty({ example: "AZE", description: "Серия паспорта", required: false })
  p_series: string;

  @IsString()
  @ApiProperty({ example: "14889522", description: "Номер паспорта", required: false })
  p_number: string;

  @IsString()
  @ApiProperty({ example: "ASAN1", description: "Кем выдан", required: false })
  p_by: string;

  @IsString()
  @ApiProperty({ example: "28.06.2014", description: "Когда выдан", required: false })
  p_issue_time: string;

  @IsString()
  @ApiProperty({ example: "16.03.1998", description: "Дата рождения", required: false })
  p_birth_date: string;

  @ApiProperty({ type: "string", format: "binary" })
  avatar: any;

  @ApiProperty({ type: "string", format: "binary" })
  p_scan: any;

  @ApiProperty({ type: "string", format: "binary" })
  p_pink: any;
}