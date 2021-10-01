import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository, UpdateResult } from "typeorm";
import { Category } from "../database/entities/category.entity";
import { CreateCategoryDto } from "./dto/create-category.dto";

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category) private readonly category: Repository<Category>
  ) {
  }

  async getAll(page, limit): Promise<any> {
    return await this.category.createQueryBuilder("cat").getMany();

  }

  async getChildren(parent: string, page, limit): Promise<any> {
    console.log(parent);
    return await this.category.createQueryBuilder("cat")
      .leftJoinAndSelect("cat.children", "children")
      .where("cat.id = :parent", { parent: parent })
      .getOne();
  }

  async createCategory(createCategoryDto: CreateCategoryDto): Promise<Category> {
    return await this.category.save(this.category.create(createCategoryDto));
  }

  async findOne(id: number): Promise<Category> {
    return await this.category.findOne(id);
  }

  async updateCategory(id: number, createCategoryDto: CreateCategoryDto): Promise<UpdateResult> {
    return await this.category.update(id, this.category.create(createCategoryDto));
  }

  async deleteCategory(id: number): Promise<DeleteResult> {
    return await this.category.delete(id);
  }


}
