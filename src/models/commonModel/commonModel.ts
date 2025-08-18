import { TDB } from "../../features/public/utils/types/commonTypes";
import {
  ICreateAirlinesPayload,
  ICreateAirportPayload,
  IGetOTPPayload,
  IInsertOTPPayload,
  IUpdateAirlinesPayload,
  IUpdateAirportPayload,
} from "../../utils/interfaces/common/commonInterface";
import { priorityAirports } from "../../utils/miscellaneous/constants";
import Schema from "../../utils/miscellaneous/schema";

class CommonModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  // get otp
  public async getOTP(payload: IGetOTPPayload) {
    const check = await this.db("email_otp")
      .withSchema(this.DBO_SCHEMA)
      .select("id", "hashed_otp as otp", "tried")
      .andWhere("email", payload.email)
      .andWhere("type", payload.type)
      .andWhere("matched", 0)
      .andWhere("tried", "<", 3)
      .andWhereRaw(`"create_date" + interval '3 minutes' > NOW()`);

    return check;
  }

  // insert OTP
  public async insertOTP(payload: IInsertOTPPayload) {
    return await this.db("email_otp")
      .withSchema(this.DBO_SCHEMA)
      .insert(payload);
  }

  // update otp
  public async updateOTP(
    payload: { tried: number; matched?: number },
    where: { id: number }
  ) {
    return await this.db("email_otp")
      .withSchema(this.DBO_SCHEMA)
      .update(payload)
      .where("id", where.id);
  }

  // Get Env Variable
  public async getEnv(key: string) {
    const data = await this.db("variable_env")
      .withSchema(this.DBO_SCHEMA)
      .select("*")
      .where({ key });
    if (data.length) {
      return data[0].value;
    } else {
      throw new Error(`Env variable ${key} not found!`);
    }
  }

  // update env variable
  public async updateEnv(key: string, value: string) {
    return await this.db("variable_env")
      .withSchema(this.DBO_SCHEMA)
      .update({ value })
      .where({ key });
  }

  // Get airlines
  public async getAirlines(
    airlineCode: string
  ): Promise<{ name: string; logo: string }> {
    const [airline] = await this.db("airlines")
      .withSchema(this.PUBLIC_SCHEMA)
      .select("name", "logo")
      .where((qb) => {
        if (airlineCode) {
          qb.andWhere("code", airlineCode);
        }
      });
    if (airline) {
      return airline;
    } else {
      return {
        name: "Not available",
        logo: "Not available",
      };
    }
  }

  // Aircraft details by code
  public getAircraft = async (code: string) => {
    const aircraft = await this.db
      .select("*")
      .from("aircraft")
      .withSchema(this.PUBLIC_SCHEMA)
      .where("code", code);

    if (aircraft.length) {
      return aircraft[0];
    } else {
      return { code: code, name: "Not available" };
    }
  };

  // get airport
  public async getAirport(airportCode: string) {
    const [airport] = await this.db
      .select("*")
      .from("airport")
      .withSchema(this.PUBLIC_SCHEMA)
      .where("iata_code", airportCode);

    if (airport) {
      return airport.name;
    } else {
      return "Not available";
    }
  }

  // get city
  public async getCity(cityCode: string) {
    if (!cityCode) {
      return "";
    }
    const [city] = await this.db
      .select("name")
      .from("city_view")
      .withSchema(this.PUBLIC_SCHEMA)
      .where("code", cityCode);

    return city?.name as string;
  }

  //get all country
  public async getAllCountry(payload: {
    id?: number | number[];
    name?: string;
  }) {
    return await this.db("country")
      .withSchema(this.PUBLIC_SCHEMA)
      .select("id", "name", "iso", "iso3", "phone_code")
      .where((qb) => {
        if (payload.id) {
          if (Array.isArray(payload.id)) qb.whereIn("id", payload.id);
          else qb.where("id", payload.id);
        }
        if (payload.name) {
          qb.andWhereILike("name", `%${payload.name}%`);
        }
      })
      .orderBy("name", "asc");
  }

  //get all city
  public async getAllCity({
    country_id,
    city_id,
    limit,
    skip,
    filter,
    name,
  }: {
    country_id?: number;
    city_id?: number;
    limit?: number;
    skip?: number;
    filter?: string;
    name?: string;
  }) {
    // console.log({ city_id });
    return await this.db("city")
      .withSchema(this.PUBLIC_SCHEMA)
      .select("id", "name")
      .where((qb) => {
        if (country_id) {
          qb.where({ country_id });
        }
        if (name) {
          qb.andWhere("name", "ilike", `%${name}%`);
        }

        if (city_id) {
          qb.andWhere("id", city_id);
        }
      })
      .orderBy("id", "asc")
      .limit(limit || 100)
      .offset(skip || 0);
  }

  //insert city
  public async insertCity(payload: {
    country_id: number;
    name: string;
    code?: string;
  }) {
    return await this.db("city")
      .withSchema(this.PUBLIC_SCHEMA)
      .insert(payload, "id");
  }

  //insert airport
  public async insertAirport(payload: ICreateAirportPayload) {
    return await this.db("airport")
      .withSchema(this.PUBLIC_SCHEMA)
      .insert(payload, "id");
  }

  //get all airport
  public async getAllAirport(
    params: {
      country_id?: number;
      name?: string;
      limit?: number;
      skip?: number;
      code?: string;
    },
    total: boolean
  ) {
    const data = await this.db("airport as air")
      .withSchema(this.PUBLIC_SCHEMA)
      .select(
        "air.id",
        "air.country_id",
        "cou.name as country",
        "air.name",
        "air.iata_code",
        "ct.id as city_id",
        "ct.name as city_name"
      )
      .join("country as cou", "cou.id", "air.country_id")
      .leftJoin("city as ct", "ct.id", "air.city")
      .where((qb) => {
        if (params.country_id) {
          qb.where("air.country_id", params.country_id);
        }
        if (params.name) {
          qb.orWhereILike("air.iata_code", `${params.name.toUpperCase()}%`);
          qb.orWhereILike("air.name", `${params.name}%`);
          qb.orWhereILike("cou.name", `${params.name}%`);
          qb.orWhereILike("ct.name", `${params.name}%`);
        }
        if (params.code) {
          qb.where("air.iata_code", params.code);
        }
      })
      .orderByRaw(
        `ARRAY_POSITION(ARRAY[${priorityAirports
          .map(() => "?")
          .join(", ")}]::TEXT[], air.iata_code) ASC NULLS LAST, air.id ASC`,
        priorityAirports
      )
      .limit(params.limit ? params.limit : 100)
      .offset(params.skip ? params.skip : 0)
      .orderBy("air.id", "asc");

    let count: any[] = [];
    if (total) {
      count = await this.db("airport as air")
        .withSchema(this.PUBLIC_SCHEMA)
        .count("air.id as total")
        .join("country as cou", "cou.id", "air.country_id")
        .where((qb) => {
          if (params.country_id) {
            qb.where("air.country_id", params.country_id);
          }
          if (params.name) {
            qb.orWhereILike("air.iata_code", `${params.name.toUpperCase()}%`);
            qb.orWhereILike("air.name", `${params.name}%`);
            qb.orWhereILike("cou.name", `${params.name}%`);
          }
        });
    }
    return { data, total: count[0]?.total };
  }

  //update airport
  public async updateAirport(payload: IUpdateAirportPayload, id: number) {
    return await this.db("airport")
      .withSchema(this.PUBLIC_SCHEMA)
      .update(payload)
      .where({ id });
  }

  //delete airport
  public async deleteAirport(id: number) {
    return await this.db("airport")
      .withSchema(this.PUBLIC_SCHEMA)
      .delete()
      .where({ id });
  }

  //insert airline
  public async insertAirline(payload: ICreateAirlinesPayload) {
    return await this.db("airlines")
      .withSchema(this.PUBLIC_SCHEMA)
      .insert(payload, "id");
  }

  //get all airlines
  public async getAllAirline(
    params: { code?: string; name?: string; limit?: number; skip?: number },
    total: boolean
  ) {
    const data = await this.db("airlines as air")
      .withSchema(this.PUBLIC_SCHEMA)
      .select("air.id", "air.code", "air.name", "air.logo")
      .where((qb) => {
        if (params.code) {
          qb.where("air.code", params.code);
        }
        if (params.name) {
          if (params.name.length === 2) {
            qb.andWhere("air.code", params.name.toUpperCase());
          } else {
            qb.andWhere("air.name", "ilike", `%${params.name}%`);
          }
        }
      })
      .limit(params.limit ? params.limit : 100)
      .offset(params.skip ? params.skip : 0)
      .orderBy("air.id", "asc");

    let count: any[] = [];
    if (total) {
      count = await this.db("airlines as air")
        .withSchema(this.PUBLIC_SCHEMA)
        .count("air.id as total")
        .where((qb) => {
          if (params.code) {
            qb.where("air.code", params.code);
          }
          if (params.name) {
            qb.andWhere("air.name", "ilike", `%${params.name}%`);
            qb.orWhere("air.code", params.name);
          }
        });
    }
    return { data, total: count[0]?.total };
  }

  //update airlines
  public async updateAirlines(payload: IUpdateAirlinesPayload, id: number) {
    return await this.db("airlines")
      .withSchema(this.PUBLIC_SCHEMA)
      .update(payload)
      .where({ id });
  }

  //delete airlines
  public async deleteAirlines(id: number) {
    return await this.db("airlines")
      .withSchema(this.PUBLIC_SCHEMA)
      .delete()
      .where({ id });
  }

  // AIRLINE DETAILS BY AIRLINE CODE
  public getAirlineDetails = async (airlineCode: string) => {
    const [airline] = await this.db
      .select("name as airline_name", "logo as airline_logo")
      .withSchema(this.PUBLIC_SCHEMA)
      .from("airlines")
      .where("code", airlineCode);

    if (airline) {
      return airline;
    } else {
      return {
        airline_name: "Not available",
        airline_logo: "Not available",
      };
    }
  };

  public async getAirportDetails(airportCode: string): Promise<{
    airport_name: string;
    city_name: string;
    city_code: string;
    time_zone: string;
    country: string;
  }> {
    const [airport] = await this.db("public.airport")
      .select(
        "airport.id",
        "airport.name",
        // "airport.time_zone",
        "city.name as city_name",
        "city.code as city_code",
        "con.nice_name as country_name"
      )
      .leftJoin("public.city", "city.id", "airport.city")
      .leftJoin("public.country as con", "con.id", "airport.country_id")
      .where("airport.iata_code", airportCode);

    if (airport) {
      return {
        airport_name: airport.name,
        city_name: airport.city_name,
        city_code: airport.city_code,
        time_zone: airport.time_zone,
        country: airport.country_name,
      };
    } else {
      return {
        airport_name: "Not available",
        city_name: "Not available",
        city_code: "Not available",
        time_zone: "Not available",
        country: "Not available",
      };
    }
  }

  //get single country by iso
  public async getCountryByIso(payload: { iso?: string; iso3?: string }) {
    return await this.db("country")
      .withSchema(this.PUBLIC_SCHEMA)
      .select("*")
      .where((qb) => {
        if (payload.iso) {
          qb.andWhere("iso", payload.iso);
        }
        if (payload.iso3) {
          qb.andWhere("iso3", payload.iso3);
        }
      })
      .first();
  }

  // insert payment link
  public async insertPaymentLink(payload: {
    link_type: "b2b" | "b2c";
    target_id: number;
    amount?: number;
    invoice_id?: string;
    created_by: number;
  }) {
    return await this.db("payment_links")
      .withSchema(this.DBO_SCHEMA)
      .insert(payload, "*");
  }

  // get all payment links
  public async getAllPaymentLinks(query: {
    link_type: "b2b" | "b2c";
    target_id: number;
    invoice_id?: string;
  }) {
    return await this.db("dbo.payment_links AS pl")
      .leftJoin("agent.agency_info AS ai", "pl.target_id", "ai.id")
      .leftJoin("b2c.users AS u", "pl.target_id", "u.id")
      .leftJoin("b2c.invoice as inv", "inv.id", "pl.invoice_id")

      .select(
        "pl.*",
        "inv.invoice_number",
        this.db.raw(`
        CASE 
          WHEN pl.link_type = 'b2b' THEN ai.agency_name
          WHEN pl.link_type = 'b2c' THEN CONCAT(u.first_name, ' ', u.last_name)
          ELSE NULL
        END AS target_name
      `)
      )
      .where((qb) => {
        if (query.link_type) {
          qb.andWhere("pl.link_type", query.link_type);
        }
        if (query.target_id) {
          qb.andWhere("pl.target_id", query.target_id);
        }
        if (query.invoice_id) {
          qb.andWhere("pl.invoice_number", query.invoice_id);
        }
      });
  }

  // get single payment link
  public async getSinglePaymentLink(query: { id: number }) {
    return await this.db("dbo.payment_links AS pl")
      .leftJoin("agent.agency_info AS ai", "pl.target_id", "ai.id")
      .leftJoin("b2c.users AS u", "pl.target_id", "u.id")
      .leftJoin("b2c.invoice as inv", "inv.id", "pl.invoice_id")
      .select(
        "pl.*",
        "inv.invoice_number",
        this.db.raw(`
        CASE 
          WHEN pl.link_type = 'b2b' THEN ai.agency_name
          WHEN pl.link_type = 'b2c' THEN CONCAT(u.first_name, ' ', u.last_name)
          ELSE NULL
        END AS target_name
      `)
      )
      .where((qb) => {
        if (query.id) {
          qb.andWhere("pl.id", query.id);
        }
      })
      .first();
  }
}
export default CommonModel;
