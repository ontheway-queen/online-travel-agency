import { TDB } from "../../features/public/utils/types/commonTypes";
import { ICreatePartialPaymentRulePayload, IGetPartialPaymentRuleQueryFilter, IUpdatePartialPaymentRulePayload } from "../../utils/interfaces/partialPaymentRulesModelInterface/partialPaymentRulesModel.interface";
import Schema from "../../utils/miscellaneous/schema";

class PartialPaymentRuleModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async create(payload: ICreatePartialPaymentRulePayload) {
    return await this.db("partial_payment_rules")
      .withSchema(this.DBO_SCHEMA)
      .insert(payload, "id");
  }

  public async update(payload: IUpdatePartialPaymentRulePayload, id: number) {
    return await this.db("partial_payment_rules")
      .withSchema(this.DBO_SCHEMA)
      .update(payload)
      .where({ id });
  }

  public async delete(id: number) {
    return await this.db("partial_payment_rules")
      .withSchema(this.DBO_SCHEMA)
      .delete()
      .where({ id });
  }

  public async getAll(query: IGetPartialPaymentRuleQueryFilter, is_total: boolean = false) {
    const data = await this.db("partial_payment_rules")
      .withSchema(this.DBO_SCHEMA)
      .select(
        "partial_payment_rules.id",
        "partial_payment_rules.flight_api_id",
        "supplier.api as flight_api_name",
        "partial_payment_rules.airline",
        "partial_payment_rules.from_dac",
        "partial_payment_rules.to_dac",
        "partial_payment_rules.one_way",
        "partial_payment_rules.round_trip",
        "partial_payment_rules.domestic",
        "partial_payment_rules.soto",
        "partial_payment_rules.travel_date_from_now",
        "partial_payment_rules.payment_before",
        "partial_payment_rules.payment_percentage",
        "partial_payment_rules.note",
        "partial_payment_rules.status",
        "partial_payment_rules.created_by",
        "partial_payment_rules.created_at"
      )
      .leftJoin("supplier", "supplier.id", "partial_payment_rules.flight_api_id")
      .where((qb) => {
        if (query.flight_api_id !== undefined) {
          qb.andWhere("partial_payment_rules.flight_api_id", query.flight_api_id);
        }
        if (query.airline) {
          qb.andWhere("partial_payment_rules.airline", query.airline);
        }
        if (query.from_dac !== undefined) {
          qb.andWhere("partial_payment_rules.from_dac", query.from_dac);
        }
        if (query.to_dac !== undefined) {
          qb.andWhere("partial_payment_rules.to_dac", query.to_dac);
        }
        if (query.one_way !== undefined) {
          qb.andWhere("partial_payment_rules.one_way", query.one_way);
        }
        if (query.round_trip !== undefined) {
          qb.andWhere("partial_payment_rules.round_trip", query.round_trip);
        }
        if (query.status !== undefined) {
          qb.andWhere("partial_payment_rules.status", query.status);
        }
        if (query.flight_api_name) {
          qb.andWhere("supplier.api", `${query.flight_api_name}`);
        }
      })
      .limit(query.limit || 100)
      .offset(query.skip || 0)
      .orderBy("partial_payment_rules.id", "desc");

    let total: any[] = [];
    if (is_total) {
      total = await this.db("partial_payment_rules")
        .withSchema(this.DBO_SCHEMA)
        .count("id as total")
        .where((qb) => {
          if (query.flight_api_id !== undefined) {
            qb.andWhere("flight_api_id", query.flight_api_id);
          }
          if (query.airline) {
            qb.andWhere("airline", query.airline);
          }
          if (query.from_dac !== undefined) {
            qb.andWhere("from_dac", query.from_dac);
          }
          if (query.to_dac !== undefined) {
            qb.andWhere("to_dac", query.to_dac);
          }
          if (query.one_way !== undefined) {
            qb.andWhere("one_way", query.one_way);
          }
          if (query.round_trip !== undefined) {
            qb.andWhere("round_trip", query.round_trip);
          }
          if (query.status !== undefined) {
            qb.andWhere("status", query.status);
          }
        });
    }

    return {
      data,
      total: total[0]?.total,
    };
  }

  public async getSingle(id: number) {
    return await this.db("partial_payment_rules")
      .withSchema(this.DBO_SCHEMA)
      .select("*")
      .where({ id });
  }

  public async getPartialPaymentCondition(payload: {
    flight_api_name: string;
    airline: string;
    from_dac?: boolean;
    to_dac?: boolean;
    one_way?: boolean;
    round_trip?: boolean;
    refundable: boolean;
    travel_date: Date | string;
    domestic?: boolean;
    soto?: boolean;
  }) {
    if (payload.refundable === false) {
      return {
        partial_payment: false,
        payment_percentage: 100,
        travel_date_from_now: 0
      };
    }
    const data = await this.db("partial_payment_rules")
      .withSchema(this.DBO_SCHEMA)
      .select("partial_payment_rules.*")
      .leftJoin("supplier", "supplier.id", "partial_payment_rules.flight_api_id")
      .where((qb) => {
        qb.where("supplier.api", payload.flight_api_name)
          .andWhere((builder) => {
            builder
              .where("partial_payment_rules.airline", payload.airline)
              .orWhereNull("partial_payment_rules.airline");
          })
        if (payload.from_dac !== undefined) {

          qb.andWhere("partial_payment_rules.from_dac", payload.from_dac)
        }
        if (payload.to_dac !== undefined) {
          qb.andWhere("partial_payment_rules.to_dac", payload.to_dac);

        }

        if (payload.one_way !== undefined) {
          qb.andWhere("partial_payment_rules.one_way", payload.one_way);
        }
        if (payload.round_trip !== undefined) {
          qb.andWhere("partial_payment_rules.round_trip", payload.round_trip);
        }
        if (payload.travel_date) {
          const travelDateFromNow = Math.ceil((new Date(payload.travel_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          qb.andWhere("partial_payment_rules.travel_date_from_now", "<=", travelDateFromNow);
        }
        if (payload.domestic !== undefined) {
          qb.andWhere("partial_payment_rules.domestic", payload.domestic)
        }
        if (payload.soto !== undefined) {
          qb.andWhere("partial_payment_rules.soto", payload.soto)
        }
      })
      .orderByRaw(`
  CASE 
    WHEN partial_payment_rules.airline = ? THEN 0
    WHEN partial_payment_rules.airline IS NULL THEN 1
    ELSE 2
  END
`, [payload.airline])
      .first();
    if (data) {
      return {
        partial_payment: true,
        payment_percentage: null,
        travel_date_from_now: data.travel_date_from_now,
        note: data.note
      }
    } else {
      return {
        partial_payment: false,
        payment_percentage: 100,
        travel_date_from_now: 0,
        note: null
      };
    }
  }
}

export default PartialPaymentRuleModel;
