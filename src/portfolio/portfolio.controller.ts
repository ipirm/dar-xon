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
import { ApiBearerAuth, ApiConsumes, ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { PortfolioService } from "./portfolio.service";
import { Portfolio } from "../database/entities/portfolio.entity";
import { CreatePortfolioDto } from "./dto/create-portfolio.dto";
import { UserDecorator } from "../decorators/user.decorator";
import { hasRoles } from "../decorators/roles.decorator";
import { Role } from "../enums/roles.enum";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { ApiImplicitQuery } from "@nestjs/swagger/dist/decorators/api-implicit-query.decorator";
import { Pagination } from "nestjs-typeorm-paginate";
import { DeleteResult, UpdateResult } from "typeorm";
import { ApiImplicitParam } from "@nestjs/swagger/dist/decorators/api-implicit-param.decorator";

@ApiTags("Portfolio")
@Controller("portfolio")
export class PortfolioController {
  constructor(
    private readonly portfolio: PortfolioService
  ) {
  }

  
  @Get("")
  @ApiOperation({ summary: "Получить все портфолио" })
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
    name: "cat",
    required: false,
    description: "ID Категории",
    type: Number
  })
  @ApiImplicitQuery({
    name: "user_id",
    required: false,
    description: "ID Пользователя",
    type: Number
  })
  getAll(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 100,
    @Query("user_id") userId: any,
    @Query("cat") cat: number
  ): Promise<Pagination<Portfolio>> {
    return this.portfolio.getAll(page, limit, userId, cat);
  }

  @ApiConsumes("multipart/form-data")
  @ApiBearerAuth()
  @hasRoles(Role.Executor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post("")
  @ApiOperation({ summary: "Создать портфолио" })
  @UseInterceptors(FileFieldsInterceptor([
    { name: "image", maxCount: 1 },
    { name: "logo", maxCount: 1 },
    { name: "files", maxCount: 10 }
  ]))
  @ApiCreatedResponse({ type: CreatePortfolioDto })
  savePortfolio(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createPortfolioDto: CreatePortfolioDto,
    @UserDecorator() user: any
  ): Promise<Portfolio> {
    return this.portfolio.savePortfolio(createPortfolioDto, files, user);
  }

  @Get(":id")
  @ApiOperation({ summary: "Получить портфолио id" })
  @ApiImplicitParam({
    name: "id",
    required: true,
    type: Number
  })
  @ApiImplicitQuery({
    name: "user_id",
    required: false,
    type: Number
  })
  getOne(
    @Param("id") id: number,
    @Query("user_id") userId: number
  ): Promise<Portfolio> {
    return this.portfolio.findOne(id,userId);
  }


  @ApiConsumes("multipart/form-data")
  @ApiBearerAuth()
  @hasRoles(Role.Executor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(":id")
  @ApiOperation({ summary: "Обновить портфолио" })
  @ApiCreatedResponse({ type: CreatePortfolioDto })
  @UseInterceptors(FileFieldsInterceptor([
    { name: "image", maxCount: 1 },
    { name: "logo", maxCount: 1 },
    { name: "files", maxCount: 10 }
  ]))
  updatePortfolio(
    @Param("id") id: number,
    @Body() createPortfolioDto: CreatePortfolioDto,
    @UploadedFiles() files: Express.Multer.File[],
    @UserDecorator() user: any
  ): Promise<UpdateResult> {
    return this.portfolio.updatePortfolio(id, createPortfolioDto, files, user);
  }


  @Delete(":id")
  @ApiOperation({ summary: "Удалить портфолио" })
  deleteExecutor(
    @Param("id") id: number
  ): Promise<DeleteResult> {
    return this.portfolio.deletePortfolio(id);
  }
}