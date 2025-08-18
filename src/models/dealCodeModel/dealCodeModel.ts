import { TDB } from "../../features/public/utils/types/commonTypes";
import {
  ICreateDealCodePayload,
  IGetDealCodeQueryFilter,
  IUpdateDealCodePayload,
} from "../../utils/interfaces/dealCodeModelInterface/dealCodeModel.interface";
import Schema from "../../utils/miscellaneous/schema";

class DealCodeModel extends Schema {
  private db: TDB;
  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async create(payload: ICreateDealCodePayload) {
    return await this.db("deal_code")
      .withSchema(this.DBO_SCHEMA)
      .insert(payload, "id");
  }

  public async update(payload: IUpdateDealCodePayload, id: number) {
    return await this.db("deal_code")
      .withSchema(this.DBO_SCHEMA)
      .update(payload)
      .where({ id });
  }

  public async delete(id: number) {
    return await this.db("deal_code")
      .withSchema(this.DBO_SCHEMA)
      .delete()
      .where({ id });
  }

  public async getAll(
    query: IGetDealCodeQueryFilter,
    is_total: boolean = false
  ) {
    const data = await this.db("deal_code")
      .withSchema(this.DBO_SCHEMA)
      .select("id", "deal_code", "api", "created_at", "status")
      .where((qb) => {
        if (query.api) {
          qb.andWhere("api", query.api);
        }
        if (query.status !== undefined) {
          qb.andWhere("status", query.status);
        }
        if (query.deal_code) {
          qb.andWhere("deal_code", query.deal_code);
        }
      })
      .limit(query.limit || 100)
      .offset(query.skip || 0)
      .orderBy("id", "desc");

    let total: any[] = [];
    if (is_total) {
      total = await this.db("deal_code")
        .withSchema(this.DBO_SCHEMA)
        .count("id as total")
        .where((qb) => {
          if (query.api) {
            qb.andWhere("api", query.api);
          }
          if (query.status !== undefined) {
            qb.andWhere("status", query.status);
          }
          if (query.deal_code) {
            qb.andWhere("deal_code", query.deal_code);
          }
        });
    }

    return {
      data,
      total: total[0]?.total,
    };
  }

  public async getSingle(id: number) {
    return await this.db("deal_code")
      .withSchema(this.DBO_SCHEMA)
      .select("*")
      .where({ id });
  }
}

export default DealCodeModel;
