import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { ApiImplicitQuery } from "@nestjs/swagger/dist/decorators/api-implicit-query.decorator";
import { AdminService } from "./admin.service";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { Admin } from "../database/entities/admin.entity";
import { DeleteResult, UpdateResult } from "typeorm";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { Pagination } from "nestjs-typeorm-paginate";
import { Executor } from "../database/entities/executor.entity";
import { Customer } from "../database/entities/customer.entity";
import { Role } from "../enums/roles.enum";
import { hasRoles } from "../decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Mail } from "../database/entities/mail.entity";


@ApiTags("Admin")
@Controller("admin")
export class AdminController {
  constructor(private readonly admin: AdminService) {
  }

  @ApiBearerAuth()
  @hasRoles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get("main-page/:role")
  @ApiOperation({ summary: "Получить всех исполнителей/заказчиков" })
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
  @ApiImplicitQuery({
    name: "banned",
    required: false,
    type: Boolean
  })
  @ApiImplicitQuery({
    name: "search",
    required: false,
    type: String
  })
  @ApiImplicitQuery({
    name: "date",
    required: false,
    type: String
  })
  @ApiImplicitQuery({
    name: "verified",
    required: false,
    type: Boolean
  })
  @ApiParam({ name: "role", enum: Role })
  getListUsers(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 100,
    @Query("banned") banned: boolean = false,
    @Param("role") role: Role = Role.Executor,
    @Query("search") search: number = null,
    @Query("date") date: number = null,
    @Query("verified") verified: boolean
  ): Promise<Pagination<Admin>> {
    return this.admin.getListUsers(page, limit, role, banned,search,date,verified);
  }

  @ApiBearerAuth()
  @hasRoles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get("customer/:id")
  @ApiOperation({ summary: "Получить заказчика по id" })
  @ApiImplicitQuery({
    name: "id",
    required: true,
    type: Number
  })
  getCustomer(
    @Param("id") id: number
  ): Promise<Customer> {
    return this.admin.getCustomer(id);
  }


  @ApiBearerAuth()
  @hasRoles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get("form-contact/list")
  @ApiOperation({ summary: "Получить все заявки ( формы обратной связи)" })
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
  getAllMails(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 100
  ): Promise<Pagination<Mail>> {
    return this.admin.getAllMails(page, limit);
  }

  @ApiBearerAuth()
  @hasRoles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get("executor/:id")
  @ApiOperation({ summary: "Получить исполнителя по id" })
  @ApiImplicitQuery({
    name: "id",
    required: true,
    type: Number
  })
  getExecutor(
    @Param("id") id: number
  ): Promise<Executor> {
    return this.admin.getExecutor(id);
  }

  @ApiBearerAuth()
  @hasRoles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get("")
  @ApiOperation({ summary: "Получить всех админов" })
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
  ): Promise<Pagination<Admin>> {
    return this.admin.getAll(page, limit);
  }

  @ApiBearerAuth()
  @hasRoles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put("customer/banned/:id")
  @ApiOperation({ summary: "Заблокировать заказчика" })
  @ApiImplicitQuery({
    name: "id",
    required: true,
    type: Number
  })
  bannedCustomer(
    @Param("id") id: number
  ): Promise<UpdateResult> {
    return this.admin.bannedCustomer(id);
  }

  @ApiBearerAuth()
  @hasRoles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put("executor/banned/:id")
  @ApiOperation({ summary: "Заблокировать исполнителя" })
  @ApiImplicitQuery({
    name: "id",
    required: true,
    type: Number
  })
  bannedExecutor(
    @Param("id") id: number
  ): Promise<UpdateResult> {
    return this.admin.bannedExecutor(id);
  }

  @ApiBearerAuth()
  @hasRoles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put("customer/banned/:id")
  @ApiOperation({ summary: "Раблокировать заказчика" })
  @ApiImplicitQuery({
    name: "id",
    required: true,
    type: Number
  })
  unBannedCustomer(
    @Param("id") id: number
  ): Promise<UpdateResult> {
    return this.admin.unBannedCustomer(id);
  }

  @ApiBearerAuth()
  @hasRoles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put("executor/banned/:id")
  @ApiOperation({ summary: "Раблокировать исполнителя" })
  @ApiImplicitQuery({
    name: "id",
    required: true,
    type: Number
  })
  unBannedExecutor(
    @Param("id") id: number
  ): Promise<UpdateResult> {
    return this.admin.unBannedExecutor(id);
  }

  @ApiBearerAuth()
  @hasRoles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put("customer/verify/:id")
  @ApiOperation({ summary: "Верефицировать заказчика" })
  @ApiImplicitQuery({
    name: "id",
    required: true,
    type: Number
  })
  updateCustomer(
    @Param("id") id: number
  ): Promise<UpdateResult> {
    return this.admin.updateCustomer(id);
  }

  @ApiBearerAuth()
  @hasRoles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put("executor/verify/:id")
  @ApiOperation({ summary: "Верефицировать исполнителя" })
  @ApiImplicitQuery({
    name: "id",
    required: true,
    type: Number
  })
  updateExecutor(
    @Param("id") id: number
  ): Promise<UpdateResult> {
    return this.admin.updateExecutor(id);
  }

  @ApiBearerAuth()
  @hasRoles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post("")
  @ApiOperation({ summary: "Создать админа" })
  @ApiCreatedResponse({ type: CreateAdminDto })
  @UseInterceptors(FileFieldsInterceptor([
    { name: "avatar", maxCount: 1 }
  ]))
  saveAdmin(
    @Body() createAdminDto: CreateAdminDto,
    @UploadedFiles() files: Array<Express.Multer.File>
  ): Promise<Admin> {
    return this.admin.saveAdmin(createAdminDto, files);
  }

  @ApiBearerAuth()
  @hasRoles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(":id")
  @ApiOperation({ summary: "Получить админа по id" })
  @ApiImplicitQuery({
    name: "id",
    required: true,
    type: Number
  })
  getOne(
    @Param("id") id: number
  ): Promise<Admin> {
    return this.admin.findOne(id);
  }

  @ApiBearerAuth()
  @hasRoles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(":id")
  @ApiOperation({ summary: "Обновить админа" })
  @UseInterceptors(FileFieldsInterceptor([
    { name: "avatar", maxCount: 1 }
  ]))
  @ApiCreatedResponse({ type: CreateAdminDto })
  @ApiImplicitQuery({
    name: "id",
    required: true,
    type: Number
  })
  updateAdmin(
    @Param("id") id: number,
    @Body() createAdminDto: CreateAdminDto,
    @UploadedFiles() files: Array<Express.Multer.File>
  ): Promise<UpdateResult> {
    return this.admin.updateAdmin(id, createAdminDto, files);
  }

  @ApiBearerAuth()
  @hasRoles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(":id")
  @ApiOperation({ summary: "Удалить админа" })
  deleteAdmin(
    @Param("id") id: number
  ): Promise<DeleteResult> {
    return this.admin.deleteAdmin(id);
  }

}
