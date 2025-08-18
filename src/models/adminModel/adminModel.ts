import { TDB } from "../../features/public/utils/types/commonTypes";
import {
  IAdminSearchQuery,
  IAdminCreatePayload,
  IUpdateProfilePayload,
  IGetAdminListFilterQuery,
} from "../../utils/interfaces/admin/adminInterface";
import { IBannerImagePayload } from "../../utils/interfaces/admin/bannerInterface";
import Schema from "../../utils/miscellaneous/schema";

class AdminModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  //get single admin
  public async getSingleAdmin(payload: IAdminSearchQuery) {
    return await this.db("user_admin as ua")
      .select("ua.*", "rl.name as role", "rl.id as role_id")
      .withSchema(this.ADMIN_SCHEMA)
      .leftJoin("roles as rl", "rl.id", "ua.role_id")
      .where((qb) => {
        if (payload.id) {
          qb.where("ua.id", payload.id);
        }
        if (payload.email) {
          qb.orWhere("email", payload.email);
        }
        if (payload.phone_number) {
          qb.orWhere("phone_number", payload.phone_number);
        }
        if (payload.username) {
          qb.orWhere("username", payload.username);
        }
      });
  }

  //update user admin
  public async updateUserAdmin(
    payload: IUpdateProfilePayload,
    where: { id?: number; email?: string }
  ) {
    return await this.db("user_admin")
      .withSchema(this.ADMIN_SCHEMA)
      .update(payload)
      .where((qb) => {
        if (where.id) {
          qb.where("id", where.id);
        }
        if (where.email) {
          qb.where("email", where.email);
        }
      });
  }

  //create admin
  public async createAdmin(payload: IAdminCreatePayload) {
    return await this.db("user_admin")
      .withSchema(this.ADMIN_SCHEMA)
      .insert(payload, "id");
  }

  //get all admin
  public async getAllAdmin(
    query: IGetAdminListFilterQuery,
    is_total: boolean = false
  ) {
    const data = await this.db("user_admin as ua")
      .withSchema(this.ADMIN_SCHEMA)
      .select(
        "ua.id",
        "ua.username",
        "ua.first_name",
        "ua.last_name",
        "ua.email",
        "ua.phone_number",
        "ua.photo",
        "rl.name as role",
        "ua.status",
        "ua.socket_id"
      )
      .leftJoin("roles as rl", "rl.id", "ua.role_id")
      .where((qb) => {
        if (query.filter) {
          qb.where((qbc) => {
            qbc.where("ua.username", "ilike", `%${query.filter}%`);
            qbc.orWhere("ua.email", "ilike", `%${query.filter}%`);
            qbc.orWhere("ua.phone_number", "ilike", `%${query.filter}%`);
          });
        }
        if (query.role) {
          qb.andWhere("rl.id", query.role);
        }
        if (query.status === "true" || query.status === "false") {
          qb.andWhere("ua.status", query.status);
        }
      })
      .orderBy("ua.id", "desc")
      .limit(query.limit ? query.limit : 100)
      .offset(query.skip ? query.skip : 0);

    let total: any[] = [];

    if (is_total) {
      total = await this.db("user_admin as ua")
        .withSchema(this.ADMIN_SCHEMA)
        .count("ua.id as total")
        .join("roles as rl", "rl.id", "ua.role_id")
        .where((qb) => {
          if (query.filter) {
            qb.where((qbc) => {
              qbc.where("ua.username", "ilike", `%${query.filter}%`);
              qbc.orWhere("ua.email", "ilike", `%${query.filter}%`);
              qbc.orWhere("ua.phone_number", "ilike", `%${query.filter}%`);
            });
          }
          if (query.role) {
            qb.andWhere("rl.id", query.role);
          }
          if (query.status === "true" || query.status === "false") {
            qb.andWhere("ua.status", query.status);
          }
        });
    }

    return {
      data: data,
      total: total[0]?.total,
    };
  }

  //get last  admin Id
  public async getLastAdminID() {
    const data = await this.db("user_admin")
      .withSchema(this.ADMIN_SCHEMA)
      .select("id")
      .orderBy("id", "desc")
      .limit(1);

    return data.length ? data[0].id : 0;
  }

  //dashboard
  public async adminDashboard() {
    const total_booking = await this.db("flight_booking")
      .withSchema(this.BTOC_SCHEMA)
      .select(
        this.db.raw(`
              COUNT(*) AS total,
              COUNT(*) FILTER (WHERE status = 'pending') AS total_pending,
              COUNT(*) FILTER (WHERE status = 'cancelled') AS total_cancelled,
              COUNT(*) FILTER (WHERE status = 'issued') AS total_issued,
              COUNT(*) FILTER (WHERE status = 'paid') AS total_paid_but_not_issued
              `)
      )
      .first();

    const total_booking_b2b = await this.db("flight_booking")
      .withSchema(this.AGENT_SCHEMA)
      .select(
        this.db.raw(`
              COUNT(*) AS total_b2b,
              COUNT(*) FILTER (WHERE status = 'pending') AS b2b_total_pending,
              COUNT(*) FILTER (WHERE status = 'booking-cancelled') AS b2b_total_cancelled,
              COUNT(*) FILTER (WHERE status = 'issued') AS b2b_total_issued
              `)
      )
      .first();
    const currentYear = new Date().getFullYear();

    const booking_graph = await this.db("flight_booking")
      .withSchema(this.BTOC_SCHEMA)
      .select(
        this.db.raw(`
          TRIM(TO_CHAR(created_at, 'Month')) AS month_name,
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE status = 'pending') AS total_pending,
          COUNT(*) FILTER (WHERE status = 'booking-cancelled') AS total_cancelled,
          COUNT(*) FILTER (WHERE status = 'issued') AS total_issued,
          COUNT(*) FILTER (WHERE status = 'paid') AS total_paid_but_not_issued
      `)
      )
      .whereRaw(`EXTRACT(YEAR FROM created_at) = ${currentYear}`)
      .groupByRaw("TRIM(TO_CHAR(created_at, 'Month'))")
      .orderByRaw("MIN(created_at)");

    const booking_graph_b2b = await this.db("flight_booking")
      .withSchema(this.AGENT_SCHEMA)
      .select(
        this.db.raw(`
          TRIM(TO_CHAR(created_at, 'Month')) AS month_name,
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE status = 'pending') AS total_pending,
          COUNT(*) FILTER (WHERE status = 'booking-cancelled') AS total_cancelled,
          COUNT(*) FILTER (WHERE status = 'issued') AS total_issued,
          COUNT(*) FILTER (WHERE status = 'paid') AS total_paid_but_not_issued
      `)
      )
      .whereRaw(`EXTRACT(YEAR FROM created_at) = ${currentYear}`)
      .groupByRaw("TRIM(TO_CHAR(created_at, 'Month'))")
      .orderByRaw("MIN(created_at)");

    return {
      total_booking: { ...total_booking, ...total_booking_b2b },
      booking_graph,
      booking_graph_b2b,
    };
  }

  //upload banner
  public async uploadBannerImage(payload: IBannerImagePayload) {
    return await this.db("banner_images")
      .withSchema(this.ADMIN_SCHEMA)
      .insert(payload);
  }

  //get banner image
  public async getBannerImage() {
    return await this.db("banner_images")
      .withSchema(this.ADMIN_SCHEMA)
      .select("id", "banner_image", "status");
  }

  //update Image Status
  public async updateImageStatus(id: number) {
    return await this.db("banner_images")
      .withSchema(this.ADMIN_SCHEMA)
      .where({ id: id })
      .update({
        status: this.db.raw("NOT status"),
      });
  }

  //get active banner image only
  public async getActiveBannerImage() {
    return await this.db("banner_images")
      .withSchema(this.ADMIN_SCHEMA)
      .select("id", "banner_image", "status")
      .where("status", "=", "true");
  }

  //search booking info
  public async searchBookingInfo(filter: string) {
    const b2bFlightResult = this.db("flight_booking as fb")
      .withSchema(this.AGENT_SCHEMA)
      .select(
        "fb.id",
        "fb.booking_id as ref_id",
        "fb.pnr_code",
        "fb.route",
        "fb.payable_amount",
        "fb.created_at",
        "fb.total_passenger",
        this.db.raw("'b2b-flight' as type"),
        "fb.status"
      )
      .leftJoin(
        "flight_booking_traveler as fbt",
        "fbt.flight_booking_id",
        "fb.id"
      )
      .joinRaw(
        "left join agent.invoice inv on inv.ref_id = fb.id and inv.ref_type = 'flight'"
      )
      .where((qb) => {
        if (filter) {
          qb.andWhere((qb) => {
            qb.whereILike("fb.booking_id", `${filter}%`);
            qb.orWhereILike("fb.pnr_code", `${filter}%`);
            qb.orWhereILike("fbt.ticket_number", `${filter}%`);
            qb.orWhereILike("inv.invoice_number", `${filter}%`);
          });
        }
      });

    const b2cFlightResult = this.db("flight_booking as fb")
      .withSchema(this.BTOC_SCHEMA)
      .select(
        "fb.id",
        "fb.booking_id as booking_ref",
        "fb.pnr_code",
        "fb.route",
        "fb.payable_amount",
        "fb.created_at",
        "fb.total_passenger",
        this.db.raw("'b2c-flight' as type"),
        "fb.status"
      )
      .leftJoin(
        "flight_booking_traveler as fbt",
        "fbt.flight_booking_id",
        "fb.id"
      )
      .joinRaw(
        "left join b2c.invoice inv on inv.ref_id = fb.id and inv.ref_type = 'flight'"
      )

      .where((qb) => {
        if (filter) {
          qb.andWhere((qb) => {
            qb.whereILike("fb.booking_id", `${filter}%`);
            qb.orWhereILike("fb.pnr_code", `${filter}%`);
            qb.orWhereILike("fbt.ticket_number", `${filter}%`);
            qb.orWhereILike("inv.invoice_number", `${filter}%`);
          });
        }
      });

    const b2bVisaResult = this.db(`${this.AGENT_SCHEMA}.visa_application as va`)
      .join(`${this.SERVICE_SCHEMA}.visa`, "visa.id", "va.visa_id")
      .leftJoin(
        `${this.PUBLIC_SCHEMA}.country`,
        "country.id",
        "visa.country_id"
      )
      .joinRaw(
        "left join agent.invoice inv on inv.ref_id = va.id and inv.ref_type = 'visa'"
      )
      .select(
        "va.id",
        "va.booking_ref",
        this.db.raw("null as pnr_code"),
        "country.name as route",
        "va.payable as payable_amount",
        "va.application_date as created_at",
        "va.traveler as total_passenger",
        this.db.raw("'b2b-visa' as type"),
        this.db.raw("null as status")
      )
      .where((qb) => {
        if (filter) {
          qb.whereILike("va.booking_ref", `${filter}%`);
          qb.orWhereILike("inv.invoice_number", `${filter}%`);
        }
      });

    const b2cVisaResult = this.db(`${this.BTOC_SCHEMA}.visa_application as va`)
      .join(`${this.SERVICE_SCHEMA}.visa`, "visa.id", "va.visa_id")
      .leftJoin(
        `${this.PUBLIC_SCHEMA}.country`,
        "country.id",
        "visa.country_id"
      )
      .joinRaw(
        "left join b2c.invoice inv on inv.ref_id = va.id and inv.ref_type = 'visa'"
      )
      .select(
        "va.id",
        "va.booking_ref",
        this.db.raw("null as pnr_code"),
        "country.name as route",
        "va.payable as payable_amount",
        "va.application_date as created_at",
        "va.traveler as total_passenger",
        this.db.raw("'b2c-visa' as type"),
        this.db.raw("null as status")
      )
      .where((qb) => {
        if (filter) {
          qb.whereILike("va.booking_ref", `${filter}%`);
          qb.orWhereILike("inv.invoice_number", `${filter}%`);
        }
      });

    const b2cTourResult = this.db(
      `${this.BTOC_SCHEMA}.tour_package_booking as tpb`
    )
      .join(`${this.SERVICE_SCHEMA}.tour_package as tp`, "tp.id", "tpb.tour_id")
      .leftJoin(`${this.PUBLIC_SCHEMA}.city`, "city.id", "tp.city_id")
      .joinRaw(
        "left join b2c.invoice inv on inv.ref_id = tpb.id and inv.ref_type = 'tour'"
      )
      .select(
        "tpb.id",
        "tpb.booking_ref",
        this.db.raw("null as pnr_code"),
        "city.name as route",
        this.db.raw(`
          ROUND(
            CASE 
              WHEN tpb.discount_type = 'FLAT' 
              THEN ((COALESCE(tpb.traveler_adult, 0) * COALESCE(tpb.adult_price, 0)) +  
                    (COALESCE(tpb.traveler_child, 0) * COALESCE(tpb.child_price, 0)) - 
                    COALESCE(tpb.discount, 0)) 
              ELSE (((COALESCE(tpb.traveler_adult, 0) * COALESCE(tpb.adult_price, 0)) +  
                     (COALESCE(tpb.traveler_child, 0) * COALESCE(tpb.child_price, 0))) - 
                    (((COALESCE(tpb.traveler_adult, 0) * COALESCE(tpb.adult_price, 0)) +  
                      (COALESCE(tpb.traveler_child, 0) * COALESCE(tpb.child_price, 0))) * COALESCE(tpb.discount, 0) / 100.0)) 
            END, 2
          ) AS payable_amount
        `),
        "tpb.created_at",
        this.db.raw(
          "(tpb.traveler_adult + tpb.traveler_child) AS total_passenger"
        ),
        this.db.raw("'b2c-tour' as type"),
        "tpb.status"
      )
      .where((qb) => {
        if (filter) {
          qb.whereILike("tpb.booking_ref", `${filter}%`);
          qb.orWhereILike("inv.invoice_number", `${filter}%`);
        }
      });

    return this.db
      .unionAll([
        b2bFlightResult,
        b2cFlightResult,
        b2bVisaResult,
        b2cVisaResult,
        b2cTourResult,
      ])
      .limit(20);
  }
}
export default AdminModel;
