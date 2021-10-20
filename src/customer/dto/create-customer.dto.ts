import { IsEmail, IsEnum, IsString, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { CustomerTypeEnum } from "../../enums/customerType.enum";
import { ApiModelProperty } from "@nestjs/swagger/dist/decorators/api-model-property.decorator";


export class CreateCustomerDto {

  @IsString()
  @ApiProperty({ example: "Ильхам", description: "Имя", required: false })
  fio: string;

  @IsString()
  @ApiProperty({ example: "w33haa", description: "login", required: false })
  login: string;

  @IsEmail()
  @ApiProperty({ example: "ilham.pirm@gmail.com", description: "почта", required: false })
  email: string;

  @IsString()
  @ApiProperty({ example: "+7945642223", description: "Номер телефона", required: true })
  phone: string;

  @IsString()
  @ApiProperty({ example: "position", description: "Позиция", required: false })
  position: string;

  @IsString()
  @ApiProperty({ example: "sign", description: "Подпись", required: false })
  sign: string;

  @IsString()
  @ApiProperty({ example: "rights_no", description: "rights_no", required: false })
  rights_no: string;

  @IsString()
  @ApiProperty({ example: "rights_date", description: "rights_date", required: false })
  rights_date: string;

  @IsString()
  @ApiProperty({ example: "rights_expire", description: "rights_expire", required: false })
  rights_expire: string;

  @IsString()
  @ApiProperty({ example: "kpp", description: "kpp", required: false })
  kpp: string;

  @IsString()
  @ApiProperty({ example: "ogrn", description: "ogrn", required: false })
  ogrn: string;
  

  @IsString()
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, { message: "1 заглавная буква, 1 символ, не менее 6 символов" })
  @ApiProperty({ example: "Ilham564/", description: "Пароль", required: false })
  password: string;

  @IsString()
  @ApiProperty({ example: "Apple", description: "Название Компании", required: false })
  company_name: string;

  @IsString()
  @ApiProperty({ example: "F.X.Xoyski 79", description: "Адресс Компании", required: false })
  company_address: string;

  @IsString()
  @ApiProperty({ example: "F.X.Xoyski 79", description: "Адресс Компании", required: false })
  company_real_address: string;

  @IsString()
  @ApiProperty({ example: "1489552", description: "ИНН", required: false })
  inn: string;

  @IsString()
  @ApiProperty({ example: "1489552", description: "БИК", required: false })
  bik: string;


  @IsString()
  @ApiProperty({ example: "AZ89AIIB410500C6434010168118", description: "Рассчетный счет", required: false })
  сhecking_account: string;

  @IsString()
  @ApiProperty({ example: "Kapital bank", description: "Название банка", required: false })
  bank_name: string;

  @IsString()
  @ApiProperty({ example: "AZ89AIIB410500C6434010168118", description: "Кор. счет", required: false })
  corporate_account: string;

  @IsString()
  @ApiProperty({ example: "Берлин", description: "Город", required: false })
  city: string;

  @IsString()
  @ApiProperty({ example: "https://tviser.agency", description: "Сайт", required: false })
  site: string;

  @IsEnum(CustomerTypeEnum)
  @ApiModelProperty({
    enum: Object.keys(CustomerTypeEnum),
    default: CustomerTypeEnum.SELF
  })
  customer_type: CustomerTypeEnum;

  @ApiProperty({ type: "array", items: { type: "string", format: "binary" }, required: false })
  files?: any[];

  @ApiProperty({ type: "string", format: "binary" })
  avatar: any;
}