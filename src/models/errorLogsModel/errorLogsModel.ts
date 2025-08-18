import { TDB } from "../../features/public/utils/types/commonTypes";
import Schema from "../../utils/miscellaneous/schema";
import {
  ERROR_LEVEL_DEBUG,
  ERROR_LEVEL_INFO,
  ERROR_LEVEL_WARNING,
  ERROR_LEVEL_ERROR,
  ERROR_LEVEL_CRITICAL,
} from "../../utils/miscellaneous/constants";

class ErrorLogsModel extends Schema {
  private db: TDB;
  constructor(db: TDB) {
    super();
    this.db = db;
  }

  //insert error logs
  public async insert(payload: {
    level:
      | typeof ERROR_LEVEL_DEBUG
      | typeof ERROR_LEVEL_INFO
      | typeof ERROR_LEVEL_WARNING
      | typeof ERROR_LEVEL_ERROR
      | typeof ERROR_LEVEL_CRITICAL;
    message: string;
    stack_trace?: string;
    source?: "B2B" | "B2C" | "ADMIN";
    user_id?: number;
    url: string;
    http_method: string;
    metadata?: {};
  }) {
    return await this.db("error_logs")
      .withSchema(this.DBO_SCHEMA)
      .insert(payload, "id");
  }

  //get error logs
  public async get(payload: {
    limit?: number;
    skip?: number;
    level?: string;
    search?: string;
  }) {
    const data = await this.db("error_logs")
      .withSchema(this.DBO_SCHEMA)
      .select("*")
      .where((qb) => {
        if (payload.level) {
          qb.andWhere("level", "ilike", payload.level);
        }
        if (payload.search) {
          qb.andWhere("message", "ilike", `%${payload.search}%`);
        }
      })
      .orderBy("id", "desc")
      .limit(payload.limit || 50)
      .offset(payload.skip || 0);

    const total = await this.db("error_logs")
      .withSchema(this.DBO_SCHEMA)
      .count("id as total");

    return { data, total: total?.[0]?.total };
  }

  //delete error logs
  public async delete(id: number | number[]) {
    return await this.db("error_logs")
      .withSchema(this.DBO_SCHEMA)
      .delete()
      .where((qb) => {
        if (typeof id === "number") {
          qb.where("id", id);
        } else if (Array.isArray(id)) {
          qb.whereIn("id", id);
        }
      });
  }
}

export default ErrorLogsModel;
