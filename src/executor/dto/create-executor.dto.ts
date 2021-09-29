import { IsEmpty, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class CreateExecutorDto {

  @IsString()
  @ApiProperty({ example: "Ильхам Пирмаммадов,Вугар", description: "ФИО", required: false })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: "+7945642223", description: "Номер телефона", required: false })
  phone: string;

  @IsString()
  @ApiProperty({ example: "password112", description: "Пароль", required: false })
  password: string;

  @IsString()
  @ApiProperty({ example: "AZE", description: "Серия паспорта", required: false })
  p_series: string;

  @IsInt()
  @ApiProperty({ example: "14889522", description: "Номер паспорта", required: false })
  p_number: number;

  @IsString()
  @ApiProperty({ example: "ASAN1", description: "Кем выдан", required: false })
  p_by: string;

  @IsString()
  @ApiProperty({ example: "28.06.2014", description: "Когда выдан", required: false })
  p_issue_time: string;

  @IsString()
  @ApiProperty({ example: "16.03.1998", description: "Дата рождения", required: false })
  p_birth_date: string;

}