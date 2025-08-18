import { TDB } from "../../features/public/utils/types/commonTypes";
import {
  ICreateInvoicePayload,
  ICreateMoneyReceiptPayload,
} from "../../utils/interfaces/agent/invoice.interface";
import {
  INVOICE_TYPE_FLIGHT,
  PARTIAL_PAYMENT_DUE_CLEAR_BEFORE,
} from "../../utils/miscellaneous/constants";
import {
  FLIGHT_TICKET_ISSUE,
  FLIGHT_BOOKING_ON_HOLD,
  FLIGHT_TICKET_IN_PROCESS,
} from "../../utils/miscellaneous/flightMiscellaneous/flightConstants";

import Schema from "../../utils/miscellaneous/schema";

export default class B2BPaymentModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  // insert invoice model
  public async insertInvoice(payload: ICreateInvoicePayload) {
    return await this.db("invoice")
      .withSchema(this.AGENT_SCHEMA)
      .insert(payload, "*");
  }

  //get invoice
  public async getInvoice(payload: {
    userId?: number;
    limit?: any;
    skip?: any;
    due?: any;
    invoice_id?: any;
    agency_id?: number;
  }) {
    const { userId, limit, skip, due, invoice_id } = payload;
    const data = await this.db("agent.invoice as inv")
      .select(
        "inv.id",
        "us.name as username",
        "inv.total_amount",
        "inv.ref_id",
        "inv.ref_type",
        "inv.due",
        "inv.refund_amount",
        "inv.invoice_number",
        "inv.details",
        "ai.agency_name",
        "ai.agency_logo",
        "ai.email as agency_email",
        "ai.phone as agency_phone",
        "ai.address as agency_address"
      )
      .leftJoin("agent.agency_info as ai", "ai.id", "inv.agency_id")
      .leftJoin("agent.btob_user as us", "us.id", "inv.user_id")
      .orderBy("inv.id", "desc")
      .limit(limit || 100)
      .offset(skip || 0)
      .where((qb) => {
        if (userId) {
          qb.andWhere("inv.user_id", userId);
        }
        if (due === "true") {
          qb.andWhereNot("inv.due", 0);
        }
        if (invoice_id) {
          qb.andWhere("inv.id", invoice_id);
        }
        if (payload.agency_id) {
          qb.andWhere("inv.agency_id", payload.agency_id);
        }
      })
      .andWhere("inv.status", true);

    let count: any[] = [];
    count = await this.db("agent.invoice as inv")
      .count("inv.id as total")
      .where((qb) => {
        if (userId) {
          qb.andWhere("inv.user_id", userId);
        }
        if (due === "true") {
          qb.andWhereNot("inv.due", 0);
        }
        if (invoice_id) {
          qb.andWhere("inv.id", invoice_id);
        }
        if (payload.agency_id) {
          qb.andWhere("inv.agency_id", payload.agency_id);
        }
      })
      .andWhere("inv.status", true);

    return { data, total: Number(count[0]?.total) };
  }

  //get last invoice
  public async getLastInvoice(payload: {
    userId?: number;
    due?: any;
    invoice_id?: any;
    agency_id?: number;
  }) {
    const { userId, due, invoice_id } = payload;
    const data = await this.db("agent.invoice as inv")
      .select(
        "inv.id",
        "us.name as username",
        "inv.total_amount",
        "inv.ref_id",
        "inv.ref_type",
        "inv.due",
        "inv.refund_amount",
        "inv.invoice_number",
        "inv.details",
        "ai.agency_name",
        "ai.agency_logo",
        "ai.email as agency_email",
        "ai.phone as agency_phone",
        "ai.address as agency_address"
      )
      .leftJoin("agent.agency_info as ai", "ai.id", "inv.agency_id")
      .leftJoin("agent.btob_user as us", "us.id", "inv.user_id")
      .orderBy("inv.id", "desc")
      .limit(1)
      .where((qb) => {
        if (userId) {
          qb.andWhere("inv.user_id", userId);
        }
        if (due === "true") {
          qb.andWhereNot("inv.due", 0);
        }
        if (invoice_id) {
          qb.andWhere("inv.id", invoice_id);
        }
        if (payload.agency_id) {
          qb.andWhere("inv.agency_id", payload.agency_id);
        }
      })


    return { data };
  }

  //get single invoice
  public async singleInvoice(id: number, agency_id?: number) {
    return await this.db("agent.invoice as inv")
      .select(
        "inv.id",
        "us.name as username",
        "inv.total_amount",
        "inv.refund_amount",
        "inv.ref_id",
        "inv.ref_type",
        "inv.due",
        "inv.invoice_number",
        "inv.details",
        "inv.created_at",
        "inv.agency_id",
        "ai.agency_name",
        "ai.agency_logo",
        "ai.email as agency_email",
        "ai.phone as agency_phone",
        "ai.address as agency_address"
      )
      .leftJoin("agent.agency_info as ai", "ai.id", "inv.agency_id")
      .leftJoin("agent.btob_user as us", "us.id", "inv.user_id")
      .where("inv.id", id)
      .andWhere((qb) => {
        if (agency_id) {
          qb.andWhere("inv.agency_id", agency_id);
        }
      })
      .andWhere("inv.status", true);
  }

  //update invoice
  public async updateInvoice(
    payload: {
      due?: number;
      status?: boolean;
      refund_amount?: number;
      due_clear_last_day?: Date;
    },
    id: number
  ) {
    await this.db("invoice")
      .withSchema(this.AGENT_SCHEMA)
      .update(payload)
      .where({ id });
  }

  //create money receipt
  public async createMoneyReceipt(payload: ICreateMoneyReceiptPayload) {
    return await this.db("money_receipt")
      .withSchema(this.AGENT_SCHEMA)
      .insert(payload, "id");
  }

  //get money receipts
  public async getMoneyReceipt(invoice_id: number) {
    return await this.db("money_receipt")
      .withSchema(this.AGENT_SCHEMA)
      .select("*")
      .where({ invoice_id });
  }

  //get due invoices for flight booking
  public async getPartialPaymentDueInvoices() {
    const subquery = this.db("agent.flight_segment as fs")
      .select("fs.departure_date", "fs.departure_time", "fs.flight_booking_id")
      .select(
        this.db.raw(
          "ROW_NUMBER() OVER (PARTITION BY fs.flight_booking_id ORDER BY fs.departure_date ASC) as rn"
        )
      )
      .as("fs");

    const data = await this.db("flight_booking as fb")
      .withSchema(this.AGENT_SCHEMA)
      .select(
        "fb.id",
        "fb.booking_id as booking_ref",
        "fb.route",
        "ai.agency_name",
        "ai.phone as agency_phone",
        "ai.agency_logo",
        "ai.email as agency_email",
        "ai.address as agency_address",
        "inv.due",
        "inv.due_clear_last_day",
        "fs.departure_date",
        "fs.departure_time",
        "fb.payable_amount",
        "fb.pnr_code"
      )
      .join("invoice as inv", "inv.ref_id", "fb.id")
      .join("agency_info as ai", "ai.id", "fb.agency_id")
      .leftJoin(subquery, "fs.flight_booking_id", "fb.id")
      .whereNotNull("inv.due_clear_last_day")
      .andWhere("fs.rn", "=", this.db.raw("1"))
      .where("inv.ref_type", INVOICE_TYPE_FLIGHT)
      .andWhere("inv.due", ">", 0)
      .andWhere("fb.status", FLIGHT_TICKET_ISSUE)
      .andWhereRaw("inv.due_clear_last_day::DATE = CURRENT_DATE");

    return data;
  }

  // partial payment history
  public async getPartialPaymentInvoiceList(payload: {
    userId?: number;
    limit?: number;
    skip?: number;
    due?: any;
    invoice_id?: number;
    agency_id?: number;
  }) {
    const { userId, limit, skip, due, invoice_id, agency_id } = payload;

    const data = await this.db("agent.invoice as inv")
      .select(
        "inv.id",
        "us.name as username",
        "inv.total_amount",
        "inv.ref_id",
        "inv.ref_type",
        "inv.due",
        "inv.refund_amount",
        "inv.created_at as booking_date",
        "inv.invoice_number",
        "inv.details",
        "ai.agency_name",
        "ai.agency_logo",
        "fb.pnr_code",
        "ai.email as agency_email",
        "ai.phone as agency_phone",
        "ai.address as agency_address",
        "fb.booking_id",
        "inv.due_clear_last_day",
        this.db.raw("COALESCE(inv.total_amount - inv.due, 0) as paid_amount"),
        this.db.raw("MIN(fs.departure_date) as travel_date")
      )
      .leftJoin("agent.agency_info as ai", "ai.id", "inv.agency_id")
      .leftJoin("agent.btob_user as us", "us.id", "inv.user_id")
      .joinRaw(
        `
        LEFT JOIN agent.flight_booking as fb
        ON fb.id = inv.ref_id
        AND inv.ref_type = 'flight'
      `
      )
      .joinRaw(
        `
        LEFT JOIN agent.flight_segment as fs
        ON fs.flight_booking_id = fb.id
      `
      )
      .where((qb) => {
        qb.whereIn("fb.status", [
          FLIGHT_TICKET_ISSUE,
          FLIGHT_BOOKING_ON_HOLD,
          FLIGHT_TICKET_IN_PROCESS,
        ]);
        qb.andWhere("inv.due", ">", 0);
        qb.andWhere(this.db.raw("inv.total_amount - inv.due > 0"));
        qb.andWhere("inv.status", true);
        if (userId) {
          qb.andWhere("inv.user_id", userId);
        }
        if (invoice_id) {
          qb.andWhere("inv.id", invoice_id);
        }
        if (agency_id) {
          qb.andWhere("inv.agency_id", agency_id);
        }
      })
      .groupBy([
        "inv.id",
        "us.name",
        "inv.total_amount",
        "inv.ref_id",
        "inv.ref_type",
        "inv.due",
        "inv.refund_amount",
        "inv.invoice_number",
        "inv.details",
        "fb.pnr_code",
        "ai.agency_name",
        "ai.agency_logo",
        "ai.email",
        "ai.phone",
        "ai.address",
        "fb.booking_id",
      ])
      .orderBy("inv.id", "desc")
      .limit(limit || 100)
      .offset(skip || 0);

    let count: any[] = [];
    count = await this.db("agent.invoice as inv")
      .count("inv.id as total")
      .joinRaw(
        `
        LEFT JOIN agent.flight_booking as fb
        ON fb.id = inv.ref_id
        AND inv.ref_type = 'flight'
      `
      )
      .where((qb) => {
        qb.whereIn("fb.status", [
          FLIGHT_TICKET_ISSUE,
          FLIGHT_BOOKING_ON_HOLD,
          FLIGHT_TICKET_IN_PROCESS,
        ]);
        qb.andWhere("inv.due", ">", 0);
        qb.andWhere(this.db.raw("inv.total_amount - inv.due > 0"));
        qb.andWhere("inv.status", true);
        if (userId) {
          qb.andWhere("inv.user_id", userId);
        }
        if (invoice_id) {
          qb.andWhere("inv.id", invoice_id);
        }
        if (agency_id) {
          qb.andWhere("inv.agency_id", agency_id);
        }
      });

    return { data, total: Number(count[0]?.total) };
  }

  // partial payment total due

  public async getPartialPaymentTotalDue(payload: {
    userId?: number;
    invoice_id?: number;
    agency_id?: number;
  }) {
    const { userId, invoice_id, agency_id } = payload;
    let totalDue = await this.db("agent.invoice as inv")
      .sum("inv.due as total_due")
      .joinRaw(
        `
    LEFT JOIN agent.flight_booking as fb 
    ON fb.id = inv.ref_id 
    AND inv.ref_type = 'flight'
  `
      )
      .where((qb) => {
        qb.whereIn("fb.status", [
          FLIGHT_TICKET_ISSUE,
          FLIGHT_BOOKING_ON_HOLD,
          FLIGHT_TICKET_IN_PROCESS,
        ]);
        qb.andWhere("inv.due", ">", 0);
        qb.andWhere(this.db.raw("inv.total_amount - inv.due > 0"));
        qb.andWhere("inv.status", true);
        if (userId) {
          qb.andWhere("inv.user_id", userId);
        }
        if (invoice_id) {
          qb.andWhere("inv.id", invoice_id);
        }
        if (agency_id) {
          qb.andWhere("inv.agency_id", agency_id);
        }
      });

    return { total_due: Number(totalDue[0]?.total_due) || 0 };
  }

  //get total partial payment due agency wise
  public async agencyWisePartialPaymentDue() {
    const data = await this.db("invoice as inv")
      .withSchema(this.AGENT_SCHEMA)
      .select(
        "ai.id as agency_id",
        "ai.agency_name",
        "ai.agency_logo",
        "ai.email",
        "ai.phone"
      )
      .sum("inv.due as total_due")
      .join("agency_info as ai", "ai.id", "inv.agency_id")
      .join("flight_booking as fb", "fb.id", "inv.ref_id")
      .whereIn("fb.status", [
        FLIGHT_TICKET_ISSUE,
        FLIGHT_BOOKING_ON_HOLD,
        FLIGHT_TICKET_IN_PROCESS,
      ])
      .andWhere("inv.due", ">", 0)
      .andWhere("inv.ref_type", "flight")
      .andWhere("inv.status", true)
      .groupBy(
        "ai.id",
        "ai.agency_name",
        "ai.agency_logo",
        "ai.email",
        "ai.phone"
      );
    return data;
  }
}
