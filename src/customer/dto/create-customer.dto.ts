import { IsEnum, IsOptional, IsString, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { CustomerTypeEnum } from "../../enums/customerType.enum";
import { ApiModelProperty } from "@nestjs/swagger/dist/decorators/api-model-property.decorator";


export class CreateCustomerDto {

  @ApiProperty({ example: "Ильхам", description: "Имя", required: false })
  @IsString()
  fio: string;

  @ApiProperty({ example: "w33haa", description: "login", required: false })
  @IsString()
  login: string;

  @ApiProperty({ example: "ilham.pirm@gmail.com", description: "почта", required: false })
  @IsString()
  email: string;

  @ApiProperty({ example: "+7945642223", description: "Номер телефона", required: true })
  @IsString()
  phone: string;

  @ApiProperty({ example: "position", description: "Позиция", required: false })
  @IsString()
  position: string;

  @ApiProperty({ example: "sign", description: "Подпись", required: false })
  @IsString()
  sign: string;

  @ApiProperty({ example: "rights_no", description: "rights_no", required: false })
  @IsString()
  rights_no: string;

  @ApiProperty({ example: "rights_date", description: "rights_date", required: false })
  @IsString()
  rights_date: string;

  @ApiProperty({ example: "rights_expire", description: "rights_expire", required: false })
  @IsString()
  rights_expire: string;

  @ApiProperty({ example: "kpp", description: "kpp", required: false })
  @IsString()
  kpp: string;

  @ApiProperty({ example: "ogrn", description: "ogrn", required: false })
  @IsString()
  ogrn: string;

  @ApiProperty({ example: "Ilham564/", description: "Пароль", required: false })
  @Matches(/^(?=.*[A-Z])(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&\/\ ]{8,}$/g, { message: "Пароль должен содержать большие и маленькие латинские буквы, специальные символы и быть не короче 8 символов" })
  password: string;

  @ApiProperty({ example: "Apple", description: "Название Компании", required: false })
  @IsString()
  company_name: string;

  @ApiProperty({ example: "F.X.Xoyski 79", description: "Адресс Компании", required: false })
  @IsString()
  company_address: string;

  @ApiProperty({ example: "F.X.Xoyski 79", description: "Адресс Компании", required: false })
  @IsString()
  company_real_address: string;

  @ApiProperty({ example: "1489552", description: "ИНН", required: false })
  @IsString()
  inn: string;

  @ApiProperty({ example: "1489552", description: "БИК", required: false })
  @IsString()
  bik: string;

  @ApiProperty({ example: "AZ89AIIB410500C6434010168118", description: "Рассчетный счет", required: false })
  @IsString()
  сhecking_account: string;

  @ApiProperty({ example: "Kapital bank", description: "Название банка", required: false })
  @IsString()
  bank_name: string;

  @ApiProperty({ example: "AZ89AIIB410500C6434010168118", description: "Кор. счет", required: false })
  @IsString()
  corporate_account: string;

  @ApiProperty({ example: "Берлин", description: "Город", required: false })
  @IsString()
  city: string;

  @ApiProperty({ example: "https://tviser.agency", description: "Сайт", required: false })
  @IsString()
  site: string;

  @IsEnum(CustomerTypeEnum)
  @ApiModelProperty({
    enum: Object.keys(CustomerTypeEnum),
    default: CustomerTypeEnum.SELF
  })
  customer_type: CustomerTypeEnum;

  @ApiProperty({ type: "array", items: { type: "string", format: "binary" }, required: false })
  @IsOptional()
  files?: any[];

  @ApiProperty({ type: "string", format: "binary" })
  @IsOptional()
  avatar: any;
}