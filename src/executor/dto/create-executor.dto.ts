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
  @ApiProperty({ example: "Берлин", description: "Город", required: false })
  city: string;

  @IsString()
  @ApiProperty({ example: "AZE", description: "Серия паспорта", required: false })
  about: string;

  @IsString()
  @ApiProperty({ example: "AZE", description: "Серия паспорта", required: false })
  address: string;

  @IsString()
  @ApiProperty({ example: "AZE", description: "Серия паспорта", required: false })
  passport_series: string;

  @ApiProperty({ example: "AZE", description: "Серия паспорта", required: false })
  passport_number: string;

  @IsString()
  @ApiProperty({ example: "AZE", description: "Серия паспорта", required: false })
  passport_issuer: string;

  @IsString()
  @ApiProperty({ example: "AZE", description: "Серия паспорта", required: false })
  passport_issued_at: string;

  @IsString()
  @ApiProperty({ example: "AZE", description: "Серия паспорта", required: false })
  birthdate: string;

  @ApiProperty({ type: "string", format: "binary" })
  file_rose_ticket: { name: string, url: string };

  @ApiProperty({ type: "string", format: "binary" })
  file_passport: { name: string, url: string };

  @ApiProperty({ type: "string", format: "binary" })
  file_passport_2: { name: string, url: string };

  @ApiProperty({ type: "string", format: "binary" })
  avatar: any;
}