import { TDB } from "../../features/public/utils/types/commonTypes";
import {
  ICreateInvoicePayload,
  ICreatePaymentTryPayload,
  IUpdatePaymentTryPayload,
} from "../../utils/interfaces/user/paymentInterface";
import Schema from "../../utils/miscellaneous/schema";

export default class PaymentModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  // insert invoice model
  public async insertInvoice(payload: ICreateInvoicePayload) {
    return await this.db("invoice")
      .withSchema(this.BTOC_SCHEMA)
      .insert(payload, "*");
  }

  //get invoice
  public async getInvoice(payload: {
    userId?: number;
    limit?: any;
    skip?: any;
    due?: any;
    invoice_id?: any;
  }) {
    const { userId, limit, skip, due, invoice_id } = payload;
    const data = await this.db("b2c.invoice as inv")
      .select(
        "inv.id",
        "us.username",
        "us.first_name",
        "us.last_name",
        "us.email",
        "us.phone_number",
        "inv.total_amount",
        "inv.ref_id",
        "inv.ref_type",
        "inv.due",
        "inv.invoice_number",
        "inv.details",
        "inv.refund_amount"
      )
      .leftJoin("b2c.users as us", "us.id", "inv.user_id")
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
      })
      .andWhere("inv.status", true);

    let count: any[] = [];
    count = await this.db("b2c.invoice as inv")
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
      })
      .andWhere("inv.status", true);

    return { data, total: Number(count[0]?.total) };
  }

  //get last invoice
  public async getLastInvoice(payload: {
    userId?: number;
    due?: any;
    invoice_id?: any;
  }) {
    const { userId, due, invoice_id } = payload;
    const data = await this.db("b2c.invoice as inv")
      .select(
        "inv.id",
        "us.username",
        "us.first_name",
        "us.last_name",
        "us.email",
        "us.phone_number",
        "inv.total_amount",
        "inv.ref_id",
        "inv.ref_type",
        "inv.due",
        "inv.invoice_number",
        "inv.details",
        "inv.refund_amount"
      )
      .leftJoin("b2c.users as us", "us.id", "inv.user_id")
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
      })

    return { data };
  }

  //get single invoice
  public async singleInvoice(query: {
    id?: number;
    user_id?: number;
    invoice_number?: string;
  }) {
    const { id, invoice_number, user_id } = query;
    return await this.db(`${this.BTOC_SCHEMA}.invoice as inv`)
      .join(`${this.BTOC_SCHEMA}.users as us`, "us.id", "inv.user_id")
      .select(
        "inv.id",
        "inv.ref_id",
        "inv.ref_type",
        "inv.total_amount",
        "inv.due",
        "inv.details",
        "inv.invoice_number",
        "inv.created_at",
        "us.first_name",
        "us.last_name",
        "us.email",
        "us.phone_number"
      )

      .andWhere((qb) => {
        if (user_id) {
          qb.andWhere("inv.user_id", user_id);
        }
        if (id) {
          qb.andWhere("inv.id", id);
        }
        if (invoice_number) {
          qb.andWhere("inv.invoice_number", invoice_number);
        }
      })
      .andWhere("inv.status", true);
  }

  //get invoice by booking Id
  public async getInvoiceByBookingId(booking_id: number, ref_type: string) {
    return await this.db(`${this.BTOC_SCHEMA}.invoice as inv`)
      .select(
        "inv.id",
        "inv.ref_id",
        "inv.ref_type",
        "inv.total_amount",
        "inv.due",
        "inv.details",
        "inv.invoice_number",
        "inv.created_at"
      )
      .where("inv.ref_id", booking_id)
      .andWhere("inv.ref_type", ref_type);
  }

  public async deleteInvoice(id: number) {
    // console.log(id);
    return await this.db("invoice")
      .withSchema(this.BTOC_SCHEMA)
      .where({ id })
      .del();
  }

  //update invoice
  public async updateInvoice(
    payload: { due?: number; status?: boolean; refund_amount?: number },
    id: number
  ) {
    await this.db("invoice")
      .withSchema(this.BTOC_SCHEMA)
      .update(payload)
      .where({ id });
  }

  //create money receipt
  public async createMoneyReceipt(payload: {
    invoice_id: number;
    amount: number;
    payment_time: string;
    transaction_id?: string;
    payment_type: string;
    details: string;
    payment_id?: string;
    payment_by?: string;
    payment_gateway?: string;
  }) {
    return await this.db("money_receipt")
      .withSchema(this.BTOC_SCHEMA)
      .insert(payload, "*");
  }

  //get single money receipt
  public async singleMoneyReceipt(invoice_id: number) {
    return await this.db("money_receipt")
      .withSchema(this.BTOC_SCHEMA)
      .select(
        "amount",
        "payment_time",
        "transaction_id",
        "payment_type",
        "details",
        "payment_id",
        "invoice_id",
        "payment_by"
      )
      .where({ invoice_id });
  }

  // create payment try
  public async createPaymentTry(payload: ICreatePaymentTryPayload) {
    // console.log(payload);
    return await this.db("payment_try")
      .withSchema(this.DBO_SCHEMA)
      .insert(payload)
      .returning("id");
  }

  // get payment try
  public async getSinglePaymentTry(id: number, user_id: number) {
    return await this.db("dbo.payment_try AS bpt")
      .select(
        "bpt.id",
        "bpt.status",
        "bpt.booking_id",
        "bpt.user_id",
        "fb.payable_amount",
        "fb.pnr_code",
        "fb.status"
      )
      .join("booking.flight_booking AS fb", "bpt.booking_id", "fb.id")
      .andWhere("bpt.user_id", user_id)
      .andWhere("bpt.id", id);
  }

  // update payment try
  public async updatePaymentTry(
    payload: IUpdatePaymentTryPayload,
    id: number | string
  ) {
    return await this.db("dbo.payment_try").update(payload).where({ id });
  }

  //get transactions
  public async getTransactions(
    userId?: number,
    limit?: any,
    skip?: any,
    booking_id?: any
  ) {
    const data = await this.db("invoice as inv")
      .withSchema(this.BTOC_SCHEMA)
      .select(
        "inv.id",
        "bu.name",
        "bu.email",
        "bu.mobile_number",
        "inv.total_amount",
        "inv.booking_id",
        "inv.session_id",
        "inv.type",
        "inv.bank_tran_id",
        "inv.transaction_date",
        "fb.pnr_code",
        "fb.status",
        "fb.base_fare",
        "fb.total_tax",
        "fb.payable_amount",
        "fb.ait",
        "fb.discount",
        "fb.total_passenger",
        "fb.journey_type"
      )
      .leftJoin("flight_booking as fb", "inv.booking_id", "fb.id")
      .leftJoin("btob_user as bu", "inv.created_by_agency_user_id", "bu.id")
      .where((qb) => {
        if (userId) {
          qb.andWhere("inv.created_by_agency_user_id", userId);
        }
        if (booking_id) {
          qb.andWhere("inv.booking_id", booking_id);
        }
      })
      .orderBy("inv.id", "desc")
      .limit(limit || 100)
      .offset(skip || 0);

    let count: any[] = [];
    count = await this.db("invoice as inv")
      .withSchema(this.BTOC_SCHEMA)
      .count("inv.id as total")
      .leftJoin("flight_booking as fb", "inv.booking_id", "fb.id")
      .where((qb) => {
        if (userId) {
          qb.andWhere("inv.created_by_agency_user_id", userId);
        }
        if (booking_id) {
          qb.andWhere("inv.booking_id", booking_id);
        }
      });

    return { data, total: count[0]?.total };
  }

  // get single invoice by invoice number
  public async getSingleInvoiceByInvoiceNumber(invoice_number: string) {
    return await this.db("invoice")
      .withSchema(this.BTOC_SCHEMA)
      .leftJoin("users", "users.id", "invoice.user_id")
      .select("invoice.*", "users.email", "users.first_name", "users.last_name","users.phone_number")
      .where({ invoice_number });
  }
}
