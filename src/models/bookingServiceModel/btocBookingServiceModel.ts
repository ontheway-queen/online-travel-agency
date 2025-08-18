import { TDB } from '../../features/public/utils/types/commonTypes';
import {
  ICreateSupportMessagePayload,
  ICreateSupportPayload,
  ICreateSupportTicketsPayload,
  IUpdateBookingSupportPayload,
} from '../../utils/interfaces/btoc/bookingSupport.interface';
import { booking_support_status } from '../../utils/miscellaneous/constants';
import Schema from '../../utils/miscellaneous/schema';

export class BtoCBookingServiceModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  //insert support
  public async insertSupport(payload: ICreateSupportPayload) {
    return await this.db('booking_support')
      .withSchema(this.BTOC_SCHEMA)
      .insert(payload, 'id');
  }

  //insert support ticket
  public async insertSupportTicket(
    payload: ICreateSupportTicketsPayload | ICreateSupportTicketsPayload[]
  ) {
    return await this.db('booking_support_tickets')
      .withSchema(this.BTOC_SCHEMA)
      .insert(payload);
  }

  // insert support message
  public async insertSupportMessage(payload: ICreateSupportMessagePayload) {
    return await this.db('booking_support_messages')
      .withSchema(this.BTOC_SCHEMA)
      .insert(payload);
  }

  //update support
  public async updateSupport(
    payload: IUpdateBookingSupportPayload,
    id: number
  ) {
    return await this.db('booking_support')
      .withSchema(this.BTOC_SCHEMA)
      .update(payload)
      .where({ id });
  }

  //get list
  public async getList(
    user_id?: number,
    status?: string,
    limit?: number,
    skip?: number
  ) {
    const data = await this.db('booking_support as bs')
      .withSchema(this.BTOC_SCHEMA)
      .select(
        'bs.id',
        'bs.booking_id',
        'fb.pnr_code',
        'bs.support_type',
        'bs.status',
        'bs.created_at',
        'u.username as created_by',
        'ua.first_name as closed_by',
        this.db.raw(`string_agg(bst.ticket_number, ', ') as ticket_numbers`)
      )
      .leftJoin('users as u', 'u.id', 'bs.created_by')
      .leftJoin('flight_booking as fb', 'fb.id', 'bs.booking_id')
      .joinRaw('left join admin.user_admin as ua on ua.id = bs.closed_by')
      .leftJoin('booking_support_tickets as bst', 'bs.id', 'bst.support_id')
      .groupBy(
        'bs.id',
        'bs.booking_id',
        'fb.pnr_code',
        'bs.support_type',
        'bs.status',
        'bs.created_at',
        'u.username',
        'bs.closed_by',
        'ua.first_name'
      )
      .where((qb) => {
        if (user_id) {
          qb.andWhere('bs.user_id', user_id);
        }
        if (status) {
          qb.andWhere('bs.status', status);
        }
      })
      .limit(limit || 100)
      .offset(skip || 0)
      .orderBy('bs.created_at', 'desc');

    const total = await this.db('booking_support as bs')
      .withSchema(this.BTOC_SCHEMA)
      .count('* as total')
      .leftJoin('users as u', 'u.id', 'bs.created_by')
      .leftJoin('flight_booking as fb', 'fb.id', 'bs.booking_id')
      .joinRaw('left join admin.user_admin as ua on ua.id = bs.closed_by')
      .leftJoin('booking_support_tickets as bst', 'bs.id', 'bst.support_id')
      .groupBy(
        'bs.id',
        'bs.booking_id',
        'fb.pnr_code',
        'bs.support_type',
        'bs.status',
        'bs.created_at',
        'u.username',
        'bs.closed_by',
        'ua.first_name'
      )
      .where((qb) => {
        if (user_id) {
          qb.andWhere('bs.user_id', user_id);
        }
        if (status) {
          qb.andWhere('bs.status', status);
        }
      });

    return { data, total: total[0]?.total };
  }

  //get single support
  public async getSingleSupport(payload: {
    id: number;
    user_id?: number;
    notStatus?: string;
  }) {
    const data = await this.db('booking_support as bs')
      .withSchema(this.BTOC_SCHEMA)
      .select(
        'bs.id',
        'bs.booking_id',
        'fb.pnr_code',
        'bs.support_type',
        'bs.status',
        'bs.created_at',
        'u.username as created_by',
        'u.email as created_by_email',
        'ua.first_name as closed_by',
        'bs.refund_amount',
        'bs.adjust_at',
        'bs.adjusted_by'
      )
      .leftJoin('users as u', 'u.id', 'bs.created_by')
      .leftJoin('flight_booking as fb', 'fb.id', 'bs.booking_id')
      .joinRaw('left join admin.user_admin as ua on ua.id = bs.closed_by')
      .where('bs.id', payload.id)
      .andWhere((qb) => {
        if (payload.user_id) {
          qb.andWhere('bs.user_id', payload.user_id);
        }
        if (payload.notStatus) {
          qb.andWhereNot('bs.status', payload.notStatus);
        }
      });

    const username = await this.db('user_admin')
      .withSchema(this.ADMIN_SCHEMA)
      .select('first_name as adjusted_by')
      .where('id', data[0]?.adjusted_by);

    return [data[0], username[0]];
  }

  //get tickets of a support
  public async getTickets(support_id: number) {
    return await this.db('booking_support_tickets as bst')
      .withSchema(this.AGENT_SCHEMA)
      .select(
        'bst.id',
        'fti.traveler_reference',
        'fti.traveler_given_name',
        'fti.traveler_surname',
        'fti.reservation_code',
        'fti.ticket_number'
      )
      .join('flight_ticket_issue as fti', 'fti.id', 'bst.traveler_id')
      .where('bst.support_id', support_id);
  }

  //get messages
  public async getMessages(payload: {
    limit?: number;
    skip?: number;
    support_id: number;
  }) {
    const data = await this.db('booking_support_messages as bsm')
      .withSchema(this.BTOC_SCHEMA)
      .select('id', 'message', 'attachment', 'sender', 'created_at')
      .where('support_id', payload.support_id)
      .limit(payload.limit || 100)
      .offset(payload.skip || 0)
      .orderBy('id', 'desc');

    const total = await this.db('booking_support_messages as bsm')
      .withSchema(this.BTOC_SCHEMA)
      .count('id as total')
      .where('support_id', payload.support_id);
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
