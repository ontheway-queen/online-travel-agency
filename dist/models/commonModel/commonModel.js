"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../utils/miscellaneous/constants");
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class CommonModel extends schema_1.default {
    constructor(db) {
        super();
        // Aircraft details by code
        this.getAircraft = (code) => __awaiter(this, void 0, void 0, function* () {
            const aircraft = yield this.db
                .select("*")
                .from("aircraft")
                .withSchema(this.PUBLIC_SCHEMA)
                .where("code", code);
            if (aircraft.length) {
                return aircraft[0];
            }
            else {
                return { code: code, name: "Not available" };
            }
        });
        // AIRLINE DETAILS BY AIRLINE CODE
        this.getAirlineDetails = (airlineCode) => __awaiter(this, void 0, void 0, function* () {
            const [airline] = yield this.db
                .select("name as airline_name", "logo as airline_logo")
                .withSchema(this.PUBLIC_SCHEMA)
                .from("airlines")
                .where("code", airlineCode);
            if (airline) {
                return airline;
            }
            else {
                return {
                    airline_name: "Not available",
                    airline_logo: "Not available",
                };
            }
        });
        this.db = db;
    }
    // get otp
    getOTP(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = yield this.db("email_otp")
                .withSchema(this.DBO_SCHEMA)
                .select("id", "hashed_otp as otp", "tried")
                .andWhere("email", payload.email)
                .andWhere("type", payload.type)
                .andWhere("matched", 0)
                .andWhere("tried", "<", 3)
                .andWhereRaw(`"create_date" + interval '3 minutes' > NOW()`);
            return check;
        });
    }
    // insert OTP
    insertOTP(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("email_otp")
                .withSchema(this.DBO_SCHEMA)
                .insert(payload);
        });
    }
    // update otp
    updateOTP(payload, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("email_otp")
                .withSchema(this.DBO_SCHEMA)
                .update(payload)
                .where("id", where.id);
        });
    }
    // Get Env Variable
    getEnv(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db("variable_env")
                .withSchema(this.DBO_SCHEMA)
                .select("*")
                .where({ key });
            if (data.length) {
                return data[0].value;
            }
            else {
                throw new Error(`Env variable ${key} not found!`);
            }
        });
    }
    // update env variable
    updateEnv(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("variable_env")
                .withSchema(this.DBO_SCHEMA)
                .update({ value })
                .where({ key });
        });
    }
    // Get airlines
    getAirlines(airlineCode) {
        return __awaiter(this, void 0, void 0, function* () {
            const [airline] = yield this.db("airlines")
                .withSchema(this.PUBLIC_SCHEMA)
                .select("name", "logo")
                .where((qb) => {
                if (airlineCode) {
                    qb.andWhere("code", airlineCode);
                }
            });
            if (airline) {
                return airline;
            }
            else {
                return {
                    name: "Not available",
                    logo: "Not available",
                };
            }
        });
    }
    // get airport
    getAirport(airportCode) {
        return __awaiter(this, void 0, void 0, function* () {
            const [airport] = yield this.db
                .select("*")
                .from("airport")
                .withSchema(this.PUBLIC_SCHEMA)
                .where("iata_code", airportCode);
            if (airport) {
                return airport.name;
            }
            else {
                return "Not available";
            }
        });
    }
    // get city
    getCity(cityCode) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!cityCode) {
                return "";
            }
            const [city] = yield this.db
                .select("name")
                .from("city_view")
                .withSchema(this.PUBLIC_SCHEMA)
                .where("code", cityCode);
            return city === null || city === void 0 ? void 0 : city.name;
        });
    }
    //get all country
    getAllCountry(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("country")
                .withSchema(this.PUBLIC_SCHEMA)
                .select("id", "name", "iso", "iso3", "phone_code")
                .where((qb) => {
                if (payload.id) {
                    if (Array.isArray(payload.id))
                        qb.whereIn("id", payload.id);
                    else
                        qb.where("id", payload.id);
                }
                if (payload.name) {
                    qb.andWhereILike("name", `%${payload.name}%`);
                }
            })
                .orderBy("name", "asc");
        });
    }
    //get all city
    getAllCity(_a) {
        return __awaiter(this, arguments, void 0, function* ({ country_id, city_id, limit, skip, filter, name, }) {
            // console.log({ city_id });
            return yield this.db("city")
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
        });
    }
    //insert city
    insertCity(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("city")
                .withSchema(this.PUBLIC_SCHEMA)
                .insert(payload, "id");
        });
    }
    //insert airport
    insertAirport(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("airport")
                .withSchema(this.PUBLIC_SCHEMA)
                .insert(payload, "id");
        });
    }
    //get all airport
    getAllAirport(params, total) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const data = yield this.db("airport as air")
                .withSchema(this.PUBLIC_SCHEMA)
                .select("air.id", "air.country_id", "cou.name as country", "air.name", "air.iata_code", "ct.id as city_id", "ct.name as city_name")
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
                .orderByRaw(`ARRAY_POSITION(ARRAY[${constants_1.priorityAirports
                .map(() => "?")
                .join(", ")}]::TEXT[], air.iata_code) ASC NULLS LAST, air.id ASC`, constants_1.priorityAirports)
                .limit(params.limit ? params.limit : 100)
                .offset(params.skip ? params.skip : 0)
                .orderBy("air.id", "asc");
            let count = [];
            if (total) {
                count = yield this.db("airport as air")
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
            return { data, total: (_a = count[0]) === null || _a === void 0 ? void 0 : _a.total };
        });
    }
    //update airport
    updateAirport(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("airport")
                .withSchema(this.PUBLIC_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    //delete airport
    deleteAirport(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("airport")
                .withSchema(this.PUBLIC_SCHEMA)
                .delete()
                .where({ id });
        });
    }
    //insert airline
    insertAirline(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("airlines")
                .withSchema(this.PUBLIC_SCHEMA)
                .insert(payload, "id");
        });
    }
    //get all airlines
    getAllAirline(params, total) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const data = yield this.db("airlines as air")
                .withSchema(this.PUBLIC_SCHEMA)
                .select("air.id", "air.code", "air.name", "air.logo")
                .where((qb) => {
                if (params.code) {
                    qb.where("air.code", params.code);
                }
                if (params.name) {
                    if (params.name.length === 2) {
                        qb.andWhere("air.code", params.name.toUpperCase());
                    }
                    else {
                        qb.andWhere("air.name", "ilike", `%${params.name}%`);
                    }
                }
            })
                .limit(params.limit ? params.limit : 100)
                .offset(params.skip ? params.skip : 0)
                .orderBy("air.id", "asc");
            let count = [];
            if (total) {
                count = yield this.db("airlines as air")
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
            return { data, total: (_a = count[0]) === null || _a === void 0 ? void 0 : _a.total };
        });
    }
    //update airlines
    updateAirlines(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("airlines")
                .withSchema(this.PUBLIC_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    //delete airlines
    deleteAirlines(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("airlines")
                .withSchema(this.PUBLIC_SCHEMA)
                .delete()
                .where({ id });
        });
    }
    getAirportDetails(airportCode) {
        return __awaiter(this, void 0, void 0, function* () {
            const [airport] = yield this.db("public.airport")
                .select("airport.id", "airport.name", 
            // "airport.time_zone",
            "city.name as city_name", "city.code as city_code", "con.nice_name as country_name")
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
            }
            else {
                return {
                    airport_name: "Not available",
                    city_name: "Not available",
                    city_code: "Not available",
                    time_zone: "Not available",
                    country: "Not available",
                };
            }
        });
    }
    //get single country by iso
    getCountryByIso(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("country")
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
        });
    }
    // insert payment link
    insertPaymentLink(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("payment_links")
                .withSchema(this.DBO_SCHEMA)
                .insert(payload, "*");
        });
    }
    // get all payment links
    getAllPaymentLinks(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("dbo.payment_links AS pl")
                .leftJoin("agent.agency_info AS ai", "pl.target_id", "ai.id")
                .leftJoin("b2c.users AS u", "pl.target_id", "u.id")
                .leftJoin("b2c.invoice as inv", "inv.id", "pl.invoice_id")
                .select("pl.*", "inv.invoice_number", this.db.raw(`
        CASE 
          WHEN pl.link_type = 'b2b' THEN ai.agency_name
          WHEN pl.link_type = 'b2c' THEN CONCAT(u.first_name, ' ', u.last_name)
          ELSE NULL
        END AS target_name
      `))
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
        });
    }
    // get single payment link
    getSinglePaymentLink(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db("dbo.payment_links AS pl")
                .leftJoin("agent.agency_info AS ai", "pl.target_id", "ai.id")
                .leftJoin("b2c.users AS u", "pl.target_id", "u.id")
                .leftJoin("b2c.invoice as inv", "inv.id", "pl.invoice_id")
                .select("pl.*", "inv.invoice_number", this.db.raw(`
        CASE 
          WHEN pl.link_type = 'b2b' THEN ai.agency_name
          WHEN pl.link_type = 'b2c' THEN CONCAT(u.first_name, ' ', u.last_name)
          ELSE NULL
        END AS target_name
      `))
                .where((qb) => {
                if (query.id) {
                    qb.andWhere("pl.id", query.id);
                }
            })
                .first();
        });
    }
}
exports.default = CommonModel;
