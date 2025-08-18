import { TDB } from "../../features/public/utils/types/commonTypes";
import {
  ICreateFlightBookingPayload,
  ICreateFlightBookingSSRPayload,
  IInsertB2CFlightBookingTrackingPayload,
  IInsertFlightSegmentPayload,
  IInsertFlightTravelerPayload,
} from "../../utils/interfaces/flight/flightBookingInterface";
import {
  FLIGHT_BOOKING_CONFIRMED,
  FLIGHT_BOOKING_CANCELLED,
  FLIGHT_TICKET_ISSUE,
  FLIGHT_BOOKING_REFUNDED,
  FLIGHT_BOOKING_VOID,
  FLIGHT_BOOKING_ON_HOLD,
  FLIGHT_TICKET_IN_PROCESS,
} from "../../utils/miscellaneous/flightMiscellaneous/flightConstants";
import Schema from "../../utils/miscellaneous/schema";

class BtocFlightBookingModel extends Schema {
  private db: TDB;
  constructor(db: TDB) {
    super();
    this.db = db;
  }

  // get all flight booking
  public async getAdminAllFlightBooking(payload: {
    limit?: string;
    skip?: string;
    user_id?: number;
    status?: string;
    from_date?: string;
    to_date?: string;
    name?: string;
    pnr?: string;
  }) {
    const { limit, skip, status, user_id, from_date, to_date, name, pnr } = payload;

    console.log({ payload });

    const baseQuery = this.db("b2c.flight_booking as fb").leftJoin(
      "b2c.users as us",
      "us.id",
      "fb.user_id"
    );

    const dataQuery = baseQuery
      .clone()
      .select(
        "fb.id",
        "us.id as user_id",
        "us.username as created_by",
        "fb.pnr_code",
        "fb.total_passenger",
        "fb.status",
        "fb.payable_amount",
        "fb.discount",
        "fb.api",
        "fb.journey_type",
        "fb.created_at",
        "fb.route",
        "fb.platform",
        "fb.booking_id as booking_ref",
        this.db("b2c.flight_segment as fs")
          .select("fs.departure_date")
          .whereRaw("fs.flight_booking_id = fb.id")
          .orderBy("fs.departure_date", "asc")
          .limit(1)
          .as("departure_date")
      )
      .where(function () {
        if (user_id) this.andWhere("fb.user_id", user_id);
        if (status) this.andWhere("fb.status", status);
        if (pnr) this.andWhere("fb.pnr_code", pnr);
        if (from_date && to_date)
          this.andWhereBetween("fb.created_at", [from_date, to_date]);
        if (name) {
          this.andWhere(function () {
            this.where("us.username", "ilike", `%${name.trim()}%`)
              .orWhere("fb.pnr_code", "ilike", `%${name.trim()}%`)
              .orWhere("fb.booking_id", "ilike", `%${name.trim()}%`)
              .orWhereExists(function () {
                this.select("*")
                  .from("b2c.flight_booking_traveler as fbt")
                  .whereRaw("fbt.flight_booking_id = fb.id")
                  .andWhere(function () {
                    this.where("fbt.email", "ilike", `%${name.trim()}%`);
                  });
              });
          });
        }
      })
      .orderBy("fb.id", "desc")
      .limit(limit ? parseInt(limit) : 100)
      .offset(skip ? parseInt(skip) : 0);

    const data = await dataQuery;

    const totalQuery = baseQuery
      .clone()
      .count("fb.id as total")
      .where(function () {
        if (user_id) this.andWhere("fb.user_id", user_id);
        if (status) this.andWhere("fb.status", status);
        if (from_date && to_date)
          this.andWhereBetween("fb.created_at", [from_date, to_date]);
        if (name) {
          this.andWhere(function () {
            this.where("us.username", "ilike", `%${name.trim()}%`)
              .orWhere("fb.pnr_code", "ilike", `%${name.trim()}%`)
              .orWhere("fb.booking_id", "ilike", `%${name.trim()}%`)
              .orWhereExists(function () {
                this.select("*")
                  .from("b2c.flight_booking_traveler as fbt")
                  .whereRaw("fbt.flight_booking_id = fb.id")
                  .andWhere(function () {
                    this.where("fbt.email", "ilike", `%${name.trim()}%`);
                  });
              });
          });
        }
      });

    const totalResult = await totalQuery;

    return {
      data,
      total: parseInt(totalResult[0].total as string),
    };
  }

  // get single booking
  public async getSingleFlightBooking(wherePayload: {
    pnr_code?: string;
    id: number;
    status?: string | string[];
    user_id?: number;
    statusNot?: string;
  }) {
    const { pnr_code, id, status, user_id } = wherePayload;
    return await this.db("flight_booking as fb")
      .withSchema(this.BTOC_SCHEMA)
      .select(
        "fb.id",
        "us.username as created_by",
        "us.id as user_id",
        "us.first_name",
        "us.last_name",
        "us.email",
        "fb.pnr_code",
        "fb.total_passenger",
        "fb.status",
        "fb.base_fare",
        "fb.total_tax",
        "fb.payable_amount",
        "fb.ait",
        "fb.discount",
        "fb.journey_type",
        "fb.created_at",
        "fb.convenience_fee",
        "fb.api",
        "fb.route",
        "fb.last_time",
        "fb.booking_id as booking_ref",
        "fb.airline_pnr",
        "fb.vendor_price",
        "in.due",
        "in.id as invoice_id",
        "in.invoice_number",
        this.db.raw('"in"."total_amount" - "in"."due" as "paid_amount"'),
        "fb.api_booking_ref",
        "fb.ticket_issued_on"
      )
      .leftJoin("users as us", "us.id", "fb.user_id")
      .leftJoin("invoice as in", "in.ref_id", "fb.id")
      .where(function () {
        this.andWhere({ "fb.id": id });
        if (pnr_code) {
          this.andWhere({ "fb.pnr_code": pnr_code });
        }
        if (status) {
          if (typeof status === "string")
            this.andWhere({ "fb.status": status });
          else
            this.andWhere((qb) => {
              qb.whereIn("fb.status", status);
            });
        }
        if (user_id) {
          this.andWhere({ "fb.user_id": user_id });
        }
        if (wherePayload.statusNot) {
          this.andWhereNot("fb.status", wherePayload.statusNot);
        }
      });
  }

  //get flight segment
  public async getFlightSegment(flight_booking_id: number, id?: number) {
    return await this.db("flight_segment")
      .withSchema(this.BTOC_SCHEMA)
      .select("*")
      .where({ flight_booking_id })
      .andWhere((qb) => {
        if (id) {
          qb.andWhere("id", id);
        }
      });
  }

  //get fight travelers
  public async getFlightTraveler(flight_booking_id: number, id?: number) {
    return await this.db("flight_booking_traveler as fb")
      .withSchema(this.BTOC_SCHEMA)
      .select("fb.*")
      .where({ flight_booking_id })
      .andWhere((qb) => {
        if (id) {
          qb.andWhere("id", id);
        }
      });
  }

  // insert flight booking
  public async insertFlightBooking(payload: ICreateFlightBookingPayload) {
    return await this.db("flight_booking")
      .withSchema(this.BTOC_SCHEMA)
      .insert(payload, "id");
  }

  //get single booking data
  // public async getSingleFlightBookingData(id: number) {
  //   return await this.db('flight_booking')
  //     .withSchema(this.BTOC_SCHEMA)
  //     .select('*')
  //     .where({ id });
  // }

  //get flight booking list
  public async getFlightBookingList(payload: {
    user_id: number;
    limit?: number;
    skip?: number;
    statusNot?: string;
  }) {
    const data = await this.db("flight_booking as fb")
      .withSchema(this.BTOC_SCHEMA)
      .select(
        "fb.id as booking_id",
        "fb.total_passenger",
        "fb.status",
        "fb.payable_amount",
        "fb.discount",
        "fb.convenience_fee",
        "fb.journey_type",
        "fb.created_at",
        "fb.route",
        "fb.pnr_code",
        "in.due",
        "in.id as invoice_id",
        this.db("flight_segment as fs")
          .withSchema(this.BTOC_SCHEMA)
          .select("fs.departure_date")
          .whereRaw("fs.flight_booking_id = fb.id")
          .orderBy("fs.departure_date", "asc")
          .limit(1)
          .as("departure_date")
      )
      .leftJoin("invoice as in", "in.ref_id", "fb.id")
      .leftJoin("flight_segment as fs", "fs.flight_booking_id", "fb.id")
      .where({ "fb.user_id": payload.user_id })
      .andWhere("in.ref_type", "flight")
      .andWhere((qb) => {
        if (payload.statusNot) {
          qb.andWhereNot("fb.status", payload.statusNot);
        }
      })
      .limit(payload.limit || 100)
      .offset(payload.skip || 0)
      .orderBy("fb.id", "desc");

    const total = await this.db("flight_booking as fb")
      .withSchema(this.BTOC_SCHEMA)
      .count("fb.id as total")
      .where({ "fb.user_id": payload.user_id })
      .andWhere((qb) => {
        if (payload.statusNot) {
          qb.andWhereNot("fb.status", payload.statusNot);
        }
      });

    return { data, total: parseInt(total?.[0]?.total as string) };
  }

  // insert flight segment
  public async insertFlightSegment(
    payload: IInsertFlightSegmentPayload | IInsertFlightSegmentPayload[]
  ) {
    return await this.db("flight_segment")
      .withSchema(this.BTOC_SCHEMA)
      .insert(payload);
  }
  // insert flight traveler
  public async insertFlightTraveler(
    payload: IInsertFlightTravelerPayload | IInsertFlightTravelerPayload[]
  ) {
    return await this.db("flight_booking_traveler")
      .withSchema(this.BTOC_SCHEMA)
      .insert(payload);
  }

  public async insertFlightBookingTracking(
    payload: IInsertB2CFlightBookingTrackingPayload
  ) {
    return await this.db("flight_booking_tracking")
      .withSchema(this.BTOC_SCHEMA)
      .insert(payload, "id");
  }

  //update booking
  public async updateBooking(
    payload: {
      status?: string;
      cancelled_by?: number;
      last_time?: string | null;
      airline_pnr?: string | null;
      pnr_code?: string;
      api_booking_ref?: string;
      ticket_issued_on?: Date;
      refundable?: boolean;
      vendor_price?: {};
      api?: string;
      convenience_fee?: number;
    },
    id: number
  ) {
    return await this.db("flight_booking")
      .withSchema(this.BTOC_SCHEMA)
      .update(payload)
      .where({ id });
  }

  //update travelers
  public async updateTravelers(
    payload: {
      ticket_number?: string;
      title?: string;
      first_name?: string;
      last_name?: string;
      type?: string;
      date_of_birth?: Date;
      gender?: string;
      nationality?: number;
      issuing_country?: number;
      email?: string;
      contact_number?: string;
      passport_number?: string;
      passport_expiry_date?: Date;
    },
    id: number
  ) {
    await this.db("flight_booking_traveler")
      .withSchema(this.BTOC_SCHEMA)
      .update(payload)
      .where({ id });
  }

  //update segments
  public async updateSegments(
    payload: {
      class?: string;
      baggage?: string;
      departure_date?: Date;
      arrival_date?: Date;
      departure_time?: string;
      arrival_time?: string;
      departure_terminal?: string;
      arrival_terminal?: string;
    },
    id: number
  ) {
    await this.db("flight_segment")
      .withSchema(this.BTOC_SCHEMA)
      .update(payload)
      .where({ id });
  }

  //insert pending ticket issuance
  public async insertPendingTicketIssuance(payload: {
    booking_id: number;
    user_id: number;
    api: string;
  }) {
    await this.db("pending_flight_ticket_issuance")
      .withSchema(this.BTOC_SCHEMA)
      .insert(payload, "id");
  }

  //get pending ticket issuance
  public async getPendingTicketIssuance(payload: {
    filter?: string;
    api?: string;
    status?: string;
    limit?: number;
    skip?: number;
  }) {
    const data = await this.db("pending_flight_ticket_issuance as pti")
      .withSchema(this.BTOC_SCHEMA)
      .select(
        "pti.id",
        "fb.booking_id as booking_ref",
        "fb.pnr_code",
        "fb.total_passenger",
        "fb.route",
        "fb.payable_amount",
        "pti.api",
        "fb.status as booking_status",
        "pti.status as ticket_request_status",
        "pti.created_at"
      )
      .join("flight_booking as fb", "fb.id", "pti.booking_id")
      .where((qb) => {
        if (payload.filter) {
          qb.andWhere((qbc) => {
            qbc
              .where("fb.pnr_code", "ilike", `${payload.filter}%`)
              .orWhere("fb.booking_id", "ilike", `${payload.filter}%`);
          });
        }
        if (payload.api) {
          qb.andWhere("pti.api", payload.api);
        }
        if (payload.status) {
          qb.andWhere("pti.status", payload.status);
        }
      })
      .limit(payload.limit || 100)
      .offset(payload.skip || 0)
      .orderBy("pti.id", "desc");

    const total = await this.db("pending_flight_ticket_issuance as pti")
      .withSchema(this.BTOC_SCHEMA)
      .count("pti.id as total")
      .join("flight_booking as fb", "fb.id", "pti.booking_id")
      .where((qb) => {
        if (payload.filter) {
          qb.andWhere((qbc) => {
            qbc
              .where("fb.pnr_code", "ilike", `${payload.filter}%`)
              .orWhere("fb.booking_id", "ilike", `${payload.filter}%`);
          });
        }
        if (payload.api) {
          qb.andWhere("pti.api", payload.api);
        }
        if (payload.status) {
          qb.andWhere("pti.status", payload.status);
        }
      });

    return { data, total: parseInt(total?.[0].total as string) };
  }

  //update ticket issuance
  public async updateTicketIssuance(
    payload: { status: string; updated_at: Date },
    id: number
  ) {
    await this.db("pending_flight_ticket_issuance")
      .withSchema(this.BTOC_SCHEMA)
      .update(payload)
      .where({ id });
  }

  //check flight booking
  public async checkFlightBooking(payload: {
    route: string;
    departure_date: string | Date;
    flight_number: string;
    passengers: {
      first_name: string;
      last_name: string;
      passport?: string;
      email?: string;
      phone?: string;
    }[];
    status: string | string[];
  }) {
    const query = this.db("flight_booking as fb")
      .withSchema(this.BTOC_SCHEMA)
      .join("flight_segment as fs", "fs.flight_booking_id", "fb.id")
      .join("flight_booking_traveler as fbt", "fbt.flight_booking_id", "fb.id")
      .countDistinct("fb.id as total")
      .where("fb.route", payload.route)
      .andWhere(function () {
        if (Array.isArray(payload.status)) {
          this.whereIn("fb.status", payload.status);
        } else {
          this.andWhere({ "fb.status": payload.status });
        }
      })
      .andWhere("fs.departure_date", payload.departure_date)
      .andWhere("fs.flight_number", payload.flight_number)
      .where((qb) => {
        payload.passengers.forEach((p, index) => {
          if (index === 0) {
            qb.where(function () {
              this.whereRaw('LOWER(fbt.first_name) = ?', [p.first_name.toLowerCase()])
                .andWhereRaw('LOWER(fbt.last_name) = ?', [p.last_name.toLowerCase()])
                .andWhere((subQb) => {
                  subQb
                    .whereNotNull("fbt.passport_number")
                    .orWhere("fbt.passport_number", p.passport ?? null);
                  subQb
                    .whereNotNull("fbt.email")
                    .orWhere("fbt.email", p.email ?? null);
                  subQb
                    .whereNotNull("fbt.contact_number")
                    .orWhere("fbt.contact_number", p.phone ?? null);
                });
            });
          } else {
            qb.orWhere(function () {
              this.whereRaw('LOWER(fbt.first_name) = ?', [p.first_name.toLowerCase()])
                .andWhereRaw('LOWER(fbt.last_name) = ?', [p.last_name.toLowerCase()])
                .andWhere((subQb) => {
                  subQb
                    .whereNotNull("fbt.passport_number")
                    .orWhere("fbt.passport_number", p.passport ?? null);
                  subQb
                    .whereNotNull("fbt.email")
                    .orWhere("fbt.email", p.email ?? null);
                  subQb
                    .whereNotNull("fbt.contact_number")
                    .orWhere("fbt.contact_number", p.phone ?? null);
                });
            });
          }
        });
      })
      .first();

    return Number((await query)?.total ?? 0);
  }

  //total bookings count
  public async totalBookingsCount() {
    const data = await this.db("flight_booking")
      .withSchema(this.BTOC_SCHEMA)
      .whereRaw(
        "DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)"
      )
      .select(
        this.db.raw(
          `COUNT(*) FILTER (WHERE status = '${FLIGHT_TICKET_ISSUE}') as issued,
          COUNT(*) FILTER (WHERE status = '${FLIGHT_BOOKING_REFUNDED}') as refunded,
          COUNT(*) FILTER (WHERE status = '${FLIGHT_BOOKING_VOID}') as voided,
          COUNT(*) FILTER (WHERE status = '${FLIGHT_BOOKING_CONFIRMED}') as pending,
          COUNT(*) FILTER (WHERE status = '${FLIGHT_BOOKING_ON_HOLD}') as ticket_hold,
          COUNT(*) FILTER (WHERE status = '${FLIGHT_TICKET_IN_PROCESS}') as ticket_in_process,
          COUNT(*) FILTER (WHERE status = '${FLIGHT_BOOKING_CANCELLED}') as booking_cancelled`
        )
      )
      .first();

    return data;
  }

  //booking graph for current year
  public async monthlyBookingsGraphForCurrentYear() {
    const data = await this.db("flight_booking")
      .withSchema(this.BTOC_SCHEMA)
      .whereRaw(
        "EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)"
      )
      .select(
        this.db.raw(`TO_CHAR(created_at, 'Month') AS month`),
        this.db.raw(`DATE_TRUNC('month', created_at) AS month_start`),
        this.db.raw(
          `COUNT(*) FILTER (WHERE status = '${FLIGHT_TICKET_ISSUE}') as issued`
        ),
        this.db.raw(
          `COUNT(*) FILTER (WHERE status = '${FLIGHT_BOOKING_REFUNDED}') as refunded`
        ),
        this.db.raw(
          `COUNT(*) FILTER (WHERE status = '${FLIGHT_BOOKING_VOID}') as voided`
        ),
        this.db.raw(
          `COUNT(*) FILTER (WHERE status = '${FLIGHT_BOOKING_CANCELLED}') as booking_cancelled`
        )
      )
      .groupByRaw(
        "TO_CHAR(created_at, 'Month'), DATE_TRUNC('month', created_at)"
      )
      .orderBy("month_start");

    return data.map((row) => ({
      month: row.month.trim(),
      issued: parseInt(row.issued, 10),
      refunded: parseInt(row.refunded, 10),
      voided: parseInt(row.voided, 10),
      booking_cancelled: parseInt(row.booking_cancelled, 10),
    }));
  }

  public async createFlightBookingSSR(payload: ICreateFlightBookingSSRPayload | ICreateFlightBookingSSRPayload[]) {
    return await this.db("flight_booking_ssr")
      .withSchema(this.BTOC_SCHEMA)
      .insert(payload, 'id');
  }

  public async getFlightBookingSSR(flight_booking_id: number) {
    const data = await this.db("flight_booking_ssr as fbss")
      .withSchema(this.BTOC_SCHEMA)
      .leftJoin("flight_segment as fbs", function () {
        this.on("fbss.segment_key", "=", "fbs.segment_key")
          .andOn("fbs.flight_booking_id", "=", "fbss.booking_id");
      })
      .leftJoin("flight_booking_traveler as fbt", function () {
        this.on("fbss.traveler_key", "=", "fbt.passenger_key")
          .andOn("fbt.flight_booking_id", "=", "fbss.booking_id");
      })
      .select(
        "fbss.id",
        "fbs.origin",
        "fbs.destination",
        "fbt.title",
        "fbt.first_name",
        "fbt.last_name",
        "fbss.amount",
        "fbss.description"
      )
      .where("fbss.booking_id", flight_booking_id);

    return data;
  }
}

export default BtocFlightBookingModel;
