import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository, UpdateResult } from "typeorm";
import { Criteria } from "../database/entities/criteria.entity";
import { CriteriaItem } from "../database/entities/criteria-item.entity";
import { paginate, Pagination } from "nestjs-typeorm-paginate";
import { CreateCriteriaDto } from "./dto/create-criteria.dto";
import { CreateCriteriaItemDto } from "./dto/create-criteria-item.dto";

@Injectable()
export class CriteriaService {
  constructor(
    @InjectRepository(Criteria) private readonly criteria: Repository<Criteria>,
    @InjectRepository(CriteriaItem) private readonly criteriaItem: Repository<CriteriaItem>
  ) {
  }


  async getAll(page, limit): Promise<Pagination<Criteria>> {
    const data = this.criteria.createQueryBuilder("c").leftJoinAndSelect("c.items", "items");
    return await paginate(data, { page, limit });
  }

  async saveOne(createCriteriaDto: CreateCriteriaDto): Promise<Criteria> {
    return await this.criteria.save(this.criteria.create(createCriteriaDto));
  }

  async getOne(id: number): Promise<Criteria> {
    return await this.criteria.findOne(id);
  }

  async updateCriteria(id: number, createCriteriaDto: CreateCriteriaDto): Promise<UpdateResult> {
    return await this.criteria.update(id, this.criteria.create(createCriteriaDto));
  }

  async deleteOne(id: number): Promise<DeleteResult> {
    return await this.criteria.delete(id);
  }

  async saveItem(createCriteriaItemDto: CreateCriteriaItemDto): Promise<CriteriaItem> {
    return await this.criteriaItem.save(this.criteriaItem.create(createCriteriaItemDto));
  }

  async deleteItem(id: number): Promise<DeleteResult> {
    return await this.criteriaItem.delete(id);
  }
}
