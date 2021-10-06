import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CriteriaService } from "./criteria.service";
import { ApiImplicitQuery } from "@nestjs/swagger/dist/decorators/api-implicit-query.decorator";
import { Pagination } from "nestjs-typeorm-paginate";
import { Criteria } from "../database/entities/criteria.entity";
import { CreateCriteriaDto } from "./dto/create-criteria.dto";
import { DeleteResult, UpdateResult } from "typeorm";
import { CreateCriteriaItemDto } from "./dto/create-criteria-item.dto";
import { CriteriaItem } from "../database/entities/criteria-item.entity";


@ApiTags("Criteria")
@Controller("criteria")
export class CriteriaController {
  constructor(
    private readonly criteria: CriteriaService
  ) {
  }

  @Get("")
  @ApiOperation({ summary: "Получить все критерии" })
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
  ): Promise<Pagination<Criteria>> {
    return this.criteria.getAll(page, limit);
  }

  @Post("")
  @ApiOperation({ summary: "Создать критерий" })
  @ApiCreatedResponse({ type: CreateCriteriaDto })
  saveOne(
    @Body() createCriteriaDto: CreateCriteriaDto
  ): Promise<Criteria> {
    return this.criteria.saveOne(createCriteriaDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Получить критерии по id" })
  @ApiImplicitQuery({
    name: "id",
    required: true,
    type: Number
  })
  getOne(
    @Param("id") id: number
  ): Promise<Criteria> {
    return this.criteria.getOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Обновить критерий" })
  @ApiCreatedResponse({ type: CreateCriteriaDto })
  updateCriteria(
    @Param("id") id: number,
    @Body() createCriteriaDto: CreateCriteriaDto
  ): Promise<UpdateResult> {
    return this.criteria.updateCriteria(id, createCriteriaDto);
  }


  @Delete(":id")
  @ApiOperation({ summary: "Удалить критерий" })
  deleteOne(
    @Param("id") id: number
  ): Promise<DeleteResult> {
    return this.criteria.deleteOne(id);
  }

  @Delete("item/:id")
  @ApiOperation({ summary: "Удалить значение критерия" })
  deleteItem(
    @Param("id") id: number
  ): Promise<DeleteResult> {
    return this.criteria.deleteItem(id);
  }

  @Post("item")
  @ApiOperation({ summary: "Создать значения для критерия" })
  @ApiCreatedResponse({ type: CreateCriteriaItemDto })
  saveItem(
    @Body() createCriteriaItemDto: CreateCriteriaItemDto
  ): Promise<CriteriaItem> {
    return this.criteria.saveItem(createCriteriaItemDto);
  }

}
