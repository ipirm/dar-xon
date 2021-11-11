import { IsEmail, IsEnum, IsString, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { CustomerTypeEnum } from "../../enums/customerType.enum";
import { ApiModelProperty } from "@nestjs/swagger/dist/decorators/api-model-property.decorator";

export class RegistrationCustomerDto {

  @ApiProperty({ example: "ilham.pirm2@gmail.com", description: "Почта, Хардкод-смс: 123456", required: false })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "+994503190044", description: "Номер", required: false })
  @IsString()
  phone: string;

  @ApiProperty({ example: "Ilham564/", description: "Пароль", required: false })
  @Matches(/^(?=.*[A-Z])(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&\/\ ]{6,}$/g, { message: "Пароль должен содержать большие и маленькие латинские буквы, специальные символы и быть не короче 8 символов" })
  password: string;

  @ApiProperty({ example: "w33haaa", description: "Логин", required: false })
  @IsString()
  login: string;

  @IsEnum(CustomerTypeEnum)
  @ApiModelProperty({
    enum: Object.keys(CustomerTypeEnum),
    default: CustomerTypeEnum.SELF
  })
  customer_type: CustomerTypeEnum;
}