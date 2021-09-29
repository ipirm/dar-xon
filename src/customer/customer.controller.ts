import { Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CustomerService } from "./customer.service";
import { ApiImplicitQuery } from "@nestjs/swagger/dist/decorators/api-implicit-query.decorator";
import { Pagination } from "nestjs-typeorm-paginate";
import { DeleteResult, UpdateResult } from "typeorm";
import { Customer } from "../database/entities/customer.entity";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { FilesInterceptor } from "@nestjs/platform-express";


@ApiTags("Customer")
@Controller("customer")
export class CustomerController {
  constructor(
    private readonly customer: CustomerService
  ) {
  }

  @Get("")
  @ApiOperation({ summary: "Получить всех заказчиков" })
  @ApiImplicitQuery({
    name: "page",
    required: false,
    type: Number
  })
  @ApiImplicitQuery({
    name: "limit",
    required: false,
    type: Number
  })
  getAll(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 100
  ): Promise<Pagination<Customer>> {
    return this.customer.getAll(page, limit);
  }

  @Post("")
  @UseInterceptors(FilesInterceptor("files"))
  @ApiOperation({ summary: "Создать заказчика" })
  @ApiBody({ type: CreateCustomerDto })
  saveCustomer(
    @Body() createCustomerDto: CreateCustomerDto,
    @UploadedFiles() files: Array<Express.Multer.File>
  ): Promise<Customer> {
    return this.customer.saveCustomer(createCustomerDto,files);
  }

  @Get(":id")
  @ApiOperation({ summary: "Получить заказчика по id" })
  @ApiImplicitQuery({
    name: "id",
    required: true,
    type: Number
  })
  getOne(
    @Param("id") id: number
  ): Promise<Customer> {
    return this.customer.getOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Обновить заказчика" })
  @ApiBody({ type: CreateCustomerDto })
  updateCustomer(
    @Param("id") id: number,
    @Body() createCustomerDto: CreateCustomerDto
  ): Promise<UpdateResult> {
    return this.customer.updateCustomer(id, createCustomerDto);
  }


  @Delete(":id")
  @ApiOperation({ summary: "Удалить заказчика" })
  deleteCustomer(
    @Param("id") id: number
  ): Promise<DeleteResult> {
    return this.customer.deleteCustomer(id);
  }
}
