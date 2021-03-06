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
import { ExecutorService } from "./executor.service";
import { ApiBearerAuth, ApiConsumes, ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ApiImplicitQuery } from "@nestjs/swagger/dist/decorators/api-implicit-query.decorator";
import { Pagination } from "nestjs-typeorm-paginate";
import { CreateExecutorDto } from "./dto/create-executor.dto";
import { Executor } from "../database/entities/executor.entity";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { DeleteResult, UpdateResult } from "typeorm";
import { CreateTaskDto } from "../task/dto/create-task.dto";
import { hasRoles } from "../decorators/roles.decorator";
import { Role } from "../enums/roles.enum";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { UserDecorator } from "../decorators/user.decorator";

@ApiTags("Executor")
@Controller("executor")
export class ExecutorController {
  constructor(
    private readonly executor: ExecutorService
  ) {
  }

  @Get("")
  @ApiOperation({ summary: "Получить всех исполниткелей" })
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
  ): Promise<Pagination<Executor>> {
    return this.executor.getAll(page, limit);
  }

  @Post("")
  @ApiOperation({ summary: "Создать исполнителя" })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileFieldsInterceptor([
    { name: "file_rose_ticket", maxCount: 1 },
    { name: "file_passport", maxCount: 1 },
    { name: "file_passport_2", maxCount: 1 },
    { name: "avatar", maxCount: 1 }
  ], {
    limits: {
      fileSize: 30000000
    }
  }))
  @ApiCreatedResponse({ type: CreateExecutorDto })
  saveExecutor(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() createExecutorDto: CreateExecutorDto
  ): Promise<Executor> {
    return this.executor.saveExecutor(createExecutorDto, files);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(":id")
  @ApiOperation({ summary: "Получить исполнителя по id" })
  @ApiImplicitQuery({
    name: "id",
    required: true,
    type: Number
  })
  getOne(
    @Param("id") id: number,
    @UserDecorator() user:any
  ): Promise<Executor> {
    return this.executor.findOneOrFail(id,user);
  }

  @Put(":id")
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Обновить исполнителя" })
  @ApiCreatedResponse({ type: CreateExecutorDto })
  @UseInterceptors(FileFieldsInterceptor([
    { name: "file_rose_ticket", maxCount: 1 },
    { name: "file_passport", maxCount: 1 },
    { name: "file_passport_2", maxCount: 1 },
    { name: "avatar", maxCount: 1 }
  ], {
    limits: {
      fileSize: 30000000
    }
  }))
  updateExecutor(
    @Param("id") id: number,
    @Body() createExecutorDto: CreateExecutorDto,
    @UploadedFiles() files: Express.Multer.File[]
  ): Promise<UpdateResult> {
    return this.executor.updateExecutor(id, createExecutorDto, files);
  }


  @Delete(":id")
  @ApiOperation({ summary: "Удалить исполнителя" })
  deleteExecutor(
    @Param("id") id: number
  ): Promise<DeleteResult> {
    return this.executor.deleteExecutor(id);
  }





}
