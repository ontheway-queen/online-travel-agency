import { TDB } from "../../features/public/utils/types/commonTypes";
import Schema from "../../utils/miscellaneous/schema";
export class AdminAuditTrailModel extends Schema {
  private db: TDB;
  constructor(db: TDB) {
    super();
    this.db = db;
  }
  //create audit
  public async createAudit(payload: {
    created_by: number;
    type: string;
    details: string;
  }) {
    return await this.db("admin_audit_trail")
      .withSchema(this.ADMIN_SCHEMA)
      .insert(payload);
  }
  //get audit
  public async getAudit(payload: {
    type?: string;
    limit?: number;
    skip?: number;
    from_date?: string;
    to_date?: string;
  }) {
    const data = await this.db("admin_audit_trail as at")
    .withSchema(this.ADMIN_SCHEMA)
      .select(
        "at.id",
        "ad.username as user",
        "at.type",
        "at.details",
        "at.created_at"
      )
      .leftJoin("user_admin as ad", "ad.id", "at.created_by")
      .andWhere((qb) => {
        if (payload.type) {
          qb.andWhere("at.type", payload.type);
        }
        if (payload.from_date && payload.to_date) {
          qb.andWhereBetween("at.created_at", [
            payload.from_date,
            payload.to_date,
          ]);
        }
      })
      .limit(payload.limit || 100)
      .offset(payload.skip || 0)
      .orderBy("at.id", "desc");
    const total = await this.db("admin_audit_trail as at")
    .withSchema(this.ADMIN_SCHEMA)
      .count("at.id as total")
      .andWhere((qb) => {
        if (payload.type) {
          qb.andWhere("at.type", payload.type);
        }
        if (payload.from_date && payload.to_date) {
          qb.andWhereBetween("at.created_at", [
            payload.from_date,
            payload.to_date,
          ]);
        }
      });
    return {
      data,
      total: total[0]?.total,
    };
  }
}
