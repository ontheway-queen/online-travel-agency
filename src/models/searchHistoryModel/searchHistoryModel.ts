import { TDB } from "../../features/public/utils/types/commonTypes";
import {
  ICreateFlightSearchHistoryPayload,
  IGetFlightSearchHistoryFilterQuery,
} from "../../utils/interfaces/searchHistoryModelInterface/searchHistoryModelInterface";
import Schema from "../../utils/miscellaneous/schema";

export class SearchHistoryModel extends Schema {
  private db: TDB;
  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async createFlightSearchHistory(
    payload: ICreateFlightSearchHistoryPayload
  ) {
    return await this.db("flight_search_history")
      .withSchema(this.DBO_SCHEMA)
      .insert(payload, "id");
  }

  public async getFlightSearchHistory(
    query: IGetFlightSearchHistoryFilterQuery,
    is_total: boolean = false
  ) {
    const data = this.db("dbo.flight_search_history as fsh")
      .leftJoin("agent.agency_info as ai", "fsh.agency_id", "ai.id")
      .leftJoin("agent.btob_user as bu", "fsh.searched_by", "bu.id")
      .leftJoin("b2c.users as u", "fsh.searched_by", "u.id")
      .select(
        "fsh.id",
        "fsh.user_type",
        "fsh.searched_at",
        "fsh.journey_type",
        "fsh.flight_class",
        "fsh.total_adult",
        "fsh.total_child",
        "fsh.total_infant",
        "fsh.route",
        "fsh.journey_date",
        "fsh.preferred_airlines",
        "fsh.request_body",
        this.db.raw(`
      CASE 
        WHEN fsh.user_type = 'Agent' THEN ai.agency_name
        WHEN fsh.user_type = 'User' THEN CONCAT(u.first_name, ' ', u.last_name)
        ELSE NULL
      END as source_name
    `)
      )
      .modify((qb) => {
        if (query.from_date && query.to_date) {
          console.log({ query });
          qb.whereRaw("DATE(fsh.searched_at) BETWEEN ? AND ?", [
            query.from_date,
            query.to_date,
          ]);
        }

        if (query.agency_id) {
          qb.andWhere("fsh.agency_id", query.agency_id);
        }
        if (query.user_type) {
          qb.andWhere("fsh.user_type", query.user_type);
        }
      })
      .orderBy("fsh.id", "desc");

    if (query.limit) {
      data.limit(+data.limit);
    }

    if (query.skip) {
      data.offset(+query.skip);
    }

    let total: any[] = [];
    if (is_total) {
      total = await this.db("dbo.flight_search_history as fsh")
        .count("fsh.id as total")
        .modify((qb) => {
          if (query.from_date && query.to_date) {
            console.log({ query });
            qb.whereRaw("DATE(fsh.searched_at) BETWEEN ? AND ?", [
              query.from_date,
              query.to_date,
            ]);
          }
          if (query.agency_id) {
            qb.andWhere("fsh.agency_id", query.agency_id);
          }
          if (query.user_type) {
            qb.andWhere("fsh.user_type", query.user_type);
          }
        });
    }

    return {
      data: await data,
      total: total?.[0]?.total,
    };
  }
}
