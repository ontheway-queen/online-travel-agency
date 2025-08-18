import { TDB } from "../../features/public/utils/types/commonTypes";
import {
  ICreateSupportMessagePayload,
  ICreateSupportPayload,
  ICreateSupportTicketsPayload,
  IUpdateBookingSupportPayload,
} from "../../utils/interfaces/btob/bookingSupport.interface";
import { ICreateSupportTicketMessagePayload, ICreateSupportTicketPayload, IUpdateSupportTicketPayload } from "../../utils/interfaces/supportTicket/supportTicketModel.types";
import { booking_support_status } from "../../utils/miscellaneous/constants";
import Schema from "../../utils/miscellaneous/schema";
export class SupportTicketModel extends Schema {
  private db: TDB;
  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async insertSupport(payload: ICreateSupportTicketPayload) {
    return await this.db("support_ticket")
      .withSchema(this.AGENT_SCHEMA)
      .insert(payload, "id");
  }


  // insert support message
  public async insertSupportMessage(payload: ICreateSupportTicketMessagePayload) {
    return await this.db("support_ticket_message")
      .withSchema(this.AGENT_SCHEMA)
      .insert(payload);
  }
  //update support
  public async updateSupport(
    payload: IUpdateSupportTicketPayload,
    id: number
  ) {
    return await this.db("support_ticket")
      .withSchema(this.AGENT_SCHEMA)
      .update(payload)
      .where({ id });
  }
  //get list
  public async getList(
    agency_id?: number,
    status?: string,
    limit?: number,
    skip?: number
  ) {
    const data = await this.db("support_ticket as bs")
      .withSchema(this.AGENT_SCHEMA)
      .select(
        "bs.id",
        "bs.booking_id",
        "fb.pnr_code",
        "bs.support_type",
        "bs.status",
        "bs.created_at",
        "bu.name as created_by",
        "ua.first_name as closed_by",
        this.db.raw(`string_agg(bst.ticket_number, ', ') as ticket_numbers`)
      )
      .leftJoin("btob_user as bu", "bu.id", "bs.created_by")
      .leftJoin("flight_booking as fb", "fb.id", "bs.booking_id")
      .joinRaw("left join admin.user_admin as ua on ua.id = bs.closed_by")
      .leftJoin("booking_support_tickets as bst", "bs.id", "bst.support_id")
      .groupBy(
        "bs.id",
        "bs.booking_id",
        "fb.pnr_code",
        "bs.support_type",
        "bs.status",
        "bs.created_at",
        "bu.name",
        "bs.closed_by",
        "ua.first_name"
      )
      .where((qb) => {
        if (agency_id) {
          qb.andWhere("bs.agency_id", agency_id);
        }
        if (status) {
          qb.andWhere("bs.status", status);
        }
      })
      .limit(limit || 100)
      .offset(skip || 0)
      .orderBy("bs.created_at", "desc");

    const total = await this.db("booking_support as bs")
      .withSchema(this.AGENT_SCHEMA)
      .count("* as total")
      .leftJoin("btob_user as bu", "bu.id", "bs.created_by")
      .leftJoin("flight_booking as fb", "fb.id", "bs.booking_id")
      .joinRaw("left join admin.user_admin as ua on ua.id = bs.closed_by")
      .leftJoin("booking_support_tickets as bst", "bs.id", "bst.support_id")
      .groupBy(
        "bs.id",
        "bs.booking_id",
        "fb.pnr_code",
        "bs.support_type",
        "bs.status",
        "bs.created_at",
        "bu.name",
        "bs.closed_by",
        "ua.first_name"
      )
      .where((qb) => {
        if (agency_id) {
          qb.andWhere("bs.agency_id", agency_id);
        }
        if (status) {
          qb.andWhere("bs.status", status);
        }
      });

    return { data, total: total[0]?.total };
  }

  //get single support
  public async getSingleSupport(payload: {
    id: number;
    agency_id?: number;
    notStatus?: string;
  }) {
    const data = await this.db("booking_support as bs")
      .withSchema(this.AGENT_SCHEMA)
      .select(
        "bs.id",
        "bs.booking_id",
        "fb.pnr_code",
        "bs.support_type",
        "bs.status",
        "bs.created_at",
        "ai.agency_name as created_by",
        "ai.email as created_by_email",
        "ua.first_name as closed_by",
        "bs.refund_amount",
        "bs.adjust_at",
        "bs.adjusted_by",
        "bs.agency_id"
      )
      .leftJoin("agency_info as ai", "ai.id", "bs.agency_id")
      .leftJoin("flight_booking as fb", "fb.id", "bs.booking_id")
      .joinRaw("left join admin.user_admin as ua on ua.id = bs.closed_by")

      .where("bs.id", payload.id)
      .andWhere((qb) => {
        if (payload.agency_id) {
          qb.andWhere("bs.agency_id", payload.agency_id);
        }
        if (payload.notStatus) {
          qb.andWhereNot("bs.status", payload.notStatus);
        }
      });

    const username = await this.db("user_admin")
      .withSchema(this.ADMIN_SCHEMA)
      .select("first_name as adjusted_by")
      .where("id", data[0]?.adjusted_by);

    // console.log('username', username);
    // console.log();

    return [data[0], username[0]];
  }

 
  //get messages
  public async getMessages(payload: {
    limit?: number;
    skip?: number;
    support_id: number;
  }) {
    const data = await this.db("booking_support_messages as bsm")
      .withSchema(this.AGENT_SCHEMA)
      .select("id", "message", "attachment", "sender", "created_at")
      .where("support_id", payload.support_id)
      .limit(payload.limit || 100)
      .offset(payload.skip || 0)
      .orderBy("id", "desc");

    const total = await this.db("booking_support_messages as bsm")
      .withSchema(this.AGENT_SCHEMA)
      .count("id as total")
      .where("support_id", payload.support_id);
    return { data, total: total[0]?.total };
  }

  //total support count
  public async totalSupportCount() {
    const data = await this.db("booking_support")
      .withSchema(this.AGENT_SCHEMA)
      .whereRaw("DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)")
      .select(this.db.raw(
        `COUNT(*) FILTER (WHERE status = '${booking_support_status.pending}') as pending,
          COUNT(*) FILTER (WHERE status = '${booking_support_status.processing}') as processing,
          COUNT(*) FILTER (WHERE status = '${booking_support_status.adjusted}') as adjusted,
          COUNT(*) FILTER (WHERE status = '${booking_support_status.closed}') as closed,
          COUNT(*) FILTER (WHERE status = '${booking_support_status.rejected}') as rejected`
      ))
      .first();

    return data;
  }
}
