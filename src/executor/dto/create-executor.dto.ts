import { IsString, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class CreateExecutorDto {

  @ApiProperty({ example: "Ильхам Пирмаммадов,Вугар", description: "ФИО", required: false })
  @IsString()
  fio: string;

  @ApiProperty({ example: "w33haa", description: "login", required: false })
  @IsString()
  login: string;

  @ApiProperty({ example: "+7945642223", description: "Номер телефона", required: true })
  @IsString()
  phone: string;

  @ApiProperty({ example: "password112", description: "Пароль", required: false })
  @Matches(/^(?=.*[A-Z])(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&\/\ ]{6,}$/g, { message: "1 заглавная буква, 1 символ, не менее 6 символов" })
  password: string;

  @ApiProperty({ example: "Берлин", description: "Город", required: false })
  @IsString()
  city: string;

  @ApiProperty({ example: "AZE", description: "Серия паспорта", required: false })
  @IsString()
  about: string;

  @ApiProperty({ example: "AZE", description: "Серия паспорта", required: false })
  @IsString()
  address: string;

  @ApiProperty({ example: "AZE", description: "Серия паспорта", required: false })
  @IsString()
  passport_series: string;

  @ApiProperty({ example: "AZE", description: "Серия паспорта", required: false })
  @IsString()
  passport_number: string;

  @ApiProperty({ example: "AZE", description: "Сайт", required: false })
  @IsString()
  site: string;

  @ApiProperty({ example: "ilham.pirm@gmail.com", description: "почта", required: false })
  @IsString()
  email: string;

  @ApiProperty({ example: "AZE", description: "Серия паспорта", required: false })
  @IsString()
  passport_issuer: string;

  @ApiProperty({ example: "AZE", description: "Серия паспорта", required: false })
  @IsString()
  passport_issued_at: string;

  @ApiProperty({ example: "AZE", description: "Серия паспорта", required: false })
  @IsString()
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