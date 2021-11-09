import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Admin } from "../database/entities/admin.entity";
import { paginate, Pagination } from "nestjs-typeorm-paginate";
import { DeleteResult, Repository, UpdateResult } from "typeorm";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { AwsService } from "../aws/aws.service";
import { Executor } from "../database/entities/executor.entity";
import { Customer } from "../database/entities/customer.entity";
import { Role } from "../enums/roles.enum";
import { Mail } from "../database/entities/mail.entity";
import * as bcrypt from "bcrypt";

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin) private readonly admin: Repository<Admin>,
    @InjectRepository(Executor) private readonly executor: Repository<Executor>,
    @InjectRepository(Customer) private readonly customer: Repository<Customer>,
    @InjectRepository(Mail) private readonly mail: Repository<Mail>,
    private readonly aws: AwsService
  ) {
  }

  async getAll(page, limit): Promise<Pagination<Admin>> {
    const data = this.admin.createQueryBuilder("admin");
    return paginate(data, { page, limit });
  }

  async saveAdmin(createAdminDto: CreateAdminDto, files): Promise<Admin> {
    if (files) {
      for (const [key, value] of Object.entries(files)) {
        const file = await this.aws.uploadPublicFile(value[0]);
        Object.assign(createAdminDto, { [key]: file.url });
      }
    }
    return await this.admin.save(this.admin.create(createAdminDto));
  }

  async findOne(id: number): Promise<Admin> {
    return await this.admin.findOne(id);
  }

  async updateAdmin(id: number, createAdminDto: CreateAdminDto, files): Promise<UpdateResult> {
    if (files) {
      for (const [key, value] of Object.entries(files)) {
        const file = await this.aws.uploadPublicFile(value[0]);
        Object.assign(createAdminDto, { [key]: file.url });
      }
    }
    return await this.admin.update(id, this.admin.create(createAdminDto));
  }

  async deleteAdmin(id: number): Promise<DeleteResult> {
    return await this.admin.delete(id);
  }

  async getExecutor(id: number): Promise<Executor> {
    return await this.executor.createQueryBuilder("e").where("e.id = :id", { id: id }).addSelect(["e.banned", "e.verified"]).getOne();
  }

  async getCustomer(id: number): Promise<Customer> {
    return await this.customer.createQueryBuilder("c").where("c.id = :id", { id: id }).addSelect(["c.banned", "c.verified"]).getOne();
  }

  async updateCustomer(id: number): Promise<UpdateResult> {
    return await this.customer.update(id, { verified: true });
  }

  async updateExecutor(id: number): Promise<UpdateResult> {
    return await this.executor.update(id, { verified: true });
  }

  async bannedCustomer(id: number): Promise<UpdateResult> {
    return await this.customer.update(id, { banned: true });
  }

  async bannedExecutor(id: number): Promise<UpdateResult> {
    return await this.executor.update(id, { banned: true });
  }

  async unBannedCustomer(id: number): Promise<UpdateResult> {
    return await this.customer.update(id, { banned: false });
  }

  async unBannedExecutor(id: number): Promise<UpdateResult> {
    return await this.executor.update(id, { banned: false });
  }

  async getListUsers(page, limit, role: Role, banned: boolean, search, date, verified: boolean): Promise<Pagination<any>> {
    let data: any = [];
    const searchText = decodeURI(search).toLowerCase();
    const dataText = decodeURI(date);

    if (role === Role.Executor) {
      data = this.executor.createQueryBuilder("e").addSelect(["e.banned", "e.verified"]).where("e.banned = :banned", { banned: banned });
    }

    if (role === Role.Customer) {
      data = this.customer.createQueryBuilder("e").addSelect(["e.banned", "e.verified"]).where("e.banned = :banned", { banned: banned });
    }

    if (date) {
      data.andWhere("e.createdAt = :date", { date: dataText });
    }
    if (search) {
      data.andWhere("LOWER(e.fio) ILIKE :value", { value: `%${searchText}%` });
    }
    if (verified)
      data.andWhere("e.verified = :verified", { verified: verified });

    data.select(["e.id", "e.fio", "e.createdAt", "e.avatar", "e.city"]);
    data.orderBy("e.createdAt", "DESC");
    return paginate(data, { page, limit });
  }

  async getOne(id: number): Promise<Admin> {
    return await this.admin.findOne(id);
  }


  async findOneSign(nickname: string, password: string): Promise<Admin> {
    const user = await this.admin.createQueryBuilder("a")
      .addSelect(["a.password", "a.currentHashedRefreshToken"])
      .where("a.email = :nickname", { nickname })
      .getOne();

    if (!user)
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: "Учетная запись c таким логином не найдена"
      }, HttpStatus.FORBIDDEN);

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: "Неверный пароль"
      }, HttpStatus.FORBIDDEN);
    }

    let tokenGen = {
      currentHashedRefreshToken: await bcrypt.hashSync(user.id.toString(), bcrypt.genSaltSync(12))
    };

    await this.executor.update(user.id, tokenGen);

    Object.assign(user, tokenGen);

    return user;
  }

  async getAllMails(page, limit): Promise<Pagination<Mail>> {
    const data = this.mail.createQueryBuilder("m")
      .leftJoin("m.customer", "c")
      .leftJoin("m.executor", "e")
      .addSelect(["e.id", "e.fio", "e.createdAt", "e.avatar", "e.city", "c.id", "c.fio", "c.createdAt", "c.avatar", "c.city"])
    return await paginate(data, { page, limit });
  }

  async verifyRefreshToken(token: string): Promise<Admin> {
    const user = await this.admin.findOne({ where: { currentHashedRefreshToken: token } });
    if (!user)
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: "Пользователь не найден"
      }, HttpStatus.CONFLICT);

    let tokenGen = {
      currentHashedRefreshToken: await bcrypt.hashSync(user.id.toString(), bcrypt.genSaltSync(12))
    };

    await this.admin.update(user.id, tokenGen);

    Object.assign(user, tokenGen);
    return user;
  }
}
