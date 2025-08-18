import { TDB } from "../../features/public/utils/types/commonTypes";
import {
  IGetAPIAirlinesParams,
  IInsertAPIAirlinesCommission,
  IUpdateAPIAirlinesCommission,
} from "../../utils/interfaces/common/commissionAirlinesRoutesInterface";
import Schema from "../../utils/miscellaneous/schema";

export class APIAirlineCommissionModel extends Schema {
  private db: TDB;
  constructor(db: TDB) {
    super();
    this.db = db;
  }

  // GET Flight API
  public async getFlightAPI({
    id,
    name,
    status,
  }: {
    id?: number;
    name?: string;
    status?: boolean;
  }) {
    return await this.db("supplier")
      .withSchema(this.DBO_SCHEMA)
      .select("*")
      .where((qb) => {
        if (id) {
          qb.andWhere("id", id);
        }
        if (name) {
          qb.andWhere("name", name);
        }
        if (status !== undefined) {
          qb.andWhere("status", status);
        }
      });
  }

  // Update Flight API
  public async updateFlightAPI(id: number, status: boolean) {
    return await this.db("set_flight_api")
      .withSchema(this.DBO_SCHEMA)
      .update({ status })
      .where({ id });
  }

  // Get Only API active Airlines
  public async getAPIActiveAirlines(set_flight_api_id: number) {
    return await this.db("api_airlines_commission")
      .withSchema(this.DBO_SCHEMA)
      .select("airline AS Code")
      .andWhere("set_flight_api_id", set_flight_api_id)
      .andWhere("status", true);
  }

  //get Only api active airlines with Code and Name
  public async getAPIActiveAirlinesName(set_flight_api_id: number) {
    return await this.db("dbo.api_airlines_commission")
      .select("airline AS Code", "airlines.name AS Name")
      .andWhere("set_flight_api_id", set_flight_api_id)
      .andWhere("status", true)
      .leftJoin("public.airlines", "api_airlines_commission.airline", "airlines.code");
  }

  // Get API Airlines Commission
  public async getAPIAirlinesCommission(
    {
      airline,
      set_flight_api_id,
      status,
      api_status,
      limit,
      skip,
    }: IGetAPIAirlinesParams,
    need_total: boolean = true
  ) {
    const data = await this.db("api_airlines_commission AS aac")
      .withSchema(this.DBO_SCHEMA)
      .select(
        "aac.id AS key",
        "aac.airline",
        "airlines.name as airline_name",
        "airlines.logo as airline_logo",
        "aac.com_domestic",
        "aac.com_from_dac",
        "aac.com_to_dac",
        "aac.com_soto",
        "aac.com_type",
        "aac.com_mode",
        "aac.status",
        "aac.booking_block",
        "aac.issue_block",
        this.db.raw(`CONCAT(cad.first_name, ' ', cad.last_name) AS created_by`),
        this.db.raw(`CONCAT(uad.first_name, ' ', uad.last_name) AS updated_by`),
        "aac.updated_at As last_updated_at",
        "aac.set_flight_api_id",
        "fa.api_name",
        "fa.api_logo"
      )

      // Need to create view with set flight api and flight api
      .joinRaw("left join ?? on ?? = ??", [
        "admin.user_admin AS cad",
        "aac.created_by",
        "cad.id",
      ])
      .joinRaw("left join ?? on ?? = ??", [
        "admin.user_admin AS uad",
        "aac.updated_by",
        "uad.id",
      ])
      .leftJoin("set_flight_api_view AS fa", "aac.set_flight_api_id", "fa.id")
      .joinRaw("left join ?? on ?? = ??", ["public.airlines", "aac.airline", "airlines.code"])
      .where((qb) => {
        if (api_status) {
          qb.andWhere("fa.status", api_status);
        }
        if (set_flight_api_id) {
          qb.andWhere("aac.set_flight_api_id", set_flight_api_id);
        }
        if (airline) {
          qb.andWhere("aac.airline", airline);
        }
        if (status !== undefined) {
          qb.andWhere("aac.status", status);
        }
      })
      .limit(limit ? Number(limit) : 100)
      .offset(skip ? Number(skip) : 0);

    let total: any[] = [];

    if (need_total) {
      total = await this.db("api_airlines_commission AS aac")
        .withSchema(this.DBO_SCHEMA)
        .count("aac.id AS total")
        .leftJoin("supplier AS fa", "aac.set_flight_api_id", "fa.id")
        .where((qb) => {
          if (api_status) {
            qb.andWhere("fa.status", api_status);
          }
          if (set_flight_api_id) {
            qb.andWhere("aac.set_flight_api_id", set_flight_api_id);
          }
          if (airline) {
            qb.andWhere("aac.airline", airline);
          }
          if (status !== undefined) {
            qb.andWhere("aac.status", status);
          }
        });
    }

    return { data, total: total[0]?.total };
  }

  // Insert API Airlines Commission
  public async insertAPIAirlinesCommission(
    payload: IInsertAPIAirlinesCommission | IInsertAPIAirlinesCommission[]
  ) {
    return await this.db("api_airlines_commission")
      .withSchema(this.DBO_SCHEMA)
      .insert(payload);
  }

  // Update API Airlines Commission
  public async updateAPIAirlinesCommission(
    id: number,
    payload: IUpdateAPIAirlinesCommission
  ) {
    await this.db("api_airlines_commission")
      .withSchema(this.DBO_SCHEMA)
      .update(payload)
      .where({ id });
  }

  // Delete API Airlines commission
  public async deleteAPIAirlinesCommission(id: number | number[]) {
    return await this.db("api_airlines_commission")
      .withSchema(this.DBO_SCHEMA)
      .del()
      .where((qb) => {
        if (typeof id === "number") {
          qb.andWhere("id", id);
        } else {
          qb.whereIn("id", id);
        }
      });
  }
}
