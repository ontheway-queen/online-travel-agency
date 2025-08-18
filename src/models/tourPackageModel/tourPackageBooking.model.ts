import {
  ICreateBookAddress,
  ITourPackageBooking,
  IUpdateBooking,
  tourPackageBookingFilterQuery,
} from '../../features/b2c/utils/types/tourPackageBookingTypes';

import { TDB } from '../../features/public/utils/types/commonTypes';
import { ICreateInvoicePayload } from '../../utils/interfaces/user/paymentInterface';
import Schema from '../../utils/miscellaneous/schema';

export class TourPackageBookingModel extends Schema {
  private db: TDB;
  constructor(db: TDB) {
    super();
    this.db = db;
  }

  //b2c
  //insert tour package book
  public async insertTourPackageBook(payload: ITourPackageBooking) {
    return await this.db('tour_package_booking')
      .withSchema(this.BTOC_SCHEMA)
      .insert(payload, 'id');
  }

  //delete tour package delete booking
  public async deleteTourPackageBook(id: number) {
    return await this.db('tour_package_booking')
      .withSchema(this.BTOC_SCHEMA)
      .where({ id })
      .del();
  }

  //insert booking contact
  public async insertTourPackageBookContact(payload: ICreateBookAddress) {
    return await this.db('tour_package_booking_contact')
      .withSchema(this.BTOC_SCHEMA)
      .insert(payload, 'id');
  }

  //get my booking history
  public async getMyBookingHistory(user_id: Number) {
    return await this.db('tour_package_booking_view')
      .withSchema(this.BTOC_SCHEMA)
      .where('user_id', user_id)
      .select('*')
      .orderBy('id', 'desc');
  }

  //get all booking requests
  public async getAllTourPackageBooking(params: tourPackageBookingFilterQuery) {
    const data = await this.db('tour_package_booking_view')
      .withSchema(this.BTOC_SCHEMA)
      .select(
        'id as booking_id',
        'tour_id',
        'travel_date',
        'first_name as contact_name',
        'email as contact_email',
        'tour_type',
        'status',
        'title',
        'adult_price',
        'child_price',
        'traveler_adult',
        'traveler_child',
        'discount',
        'discount_type',
        'booking_ref'
      )
      .where((qb) => {
        if (params.status) {
          qb.andWhere('status', params.status);
        }
        if (params.user_id) {
          qb.andWhere('user_id', params.user_id);
        }
        if (params.title) {
          qb.andWhere('title', 'ilike', `%${params.title}%`);
        }
        if (params.user_name) {
          qb.andWhere('first_name', 'ilike', `%${params.user_name}%`);
        }
        if (params.from_travel_date && params.to_travel_date) {
          const fromDate = new Date(params.from_travel_date).toISOString();

          // Create a Date object for to_date and add 1 day
          const toDate = new Date(params.to_travel_date);
          toDate.setDate(toDate.getDate() + 1); // Add one day

          // Set the new date to the beginning of the day (00:00:00.000)
          toDate.setUTCHours(0, 0, 0, 0);

          qb.andWhereBetween('travel_date', [fromDate, toDate.toISOString()]);
        }
      })
      .orderBy('id', 'desc')
      .limit(params.limit ? params.limit : 100)
      .offset(params.skip ? params.skip : 0);

    const total = await this.db('tour_package_booking_view')
      .withSchema(this.BTOC_SCHEMA)
      .count('id as total')
      .where((qb) => {
        if (params.status) {
          qb.andWhere('status', params.status);
        }
        if (params.user_id) {
          qb.andWhere('user_id', params.user_id);
        }
        if (params.title) {
          qb.andWhere('title', 'ilike', `%${params.title}%`);
        }
        if (params.user_name) {
          qb.andWhere('name', 'ilike', `%${params.user_name}%`);
        }
        if (params.from_travel_date && params.to_travel_date) {
          const fromDate = new Date(params.from_travel_date).toISOString();

          // Create a Date object for to_date and add 1 day
          const toDate = new Date(params.to_travel_date);
          toDate.setDate(toDate.getDate() + 1); // Add one day

          // Set the new date to the beginning of the day (00:00:00.000)
          toDate.setUTCHours(0, 0, 0, 0);

          qb.andWhereBetween('travel_date', [fromDate, toDate.toISOString()]);
        }
      });
    // .orderBy(
    //   'tp.adult_price',
    // )

    return {
      data: data,
      total: total[0].total,
    };
  }

  //get single user booking info
  public async getSingelUserTourPackageBooking(
    params: tourPackageBookingFilterQuery
  ) {
    const data = await this.db('tour_package_booking_view')
      .withSchema(this.BTOC_SCHEMA)
      .select('id ', 'tour_id', 'travel_date', 'tour_type', 'status', 'title','booking_ref')
      .where((qb) => {
        if (params.status) {
          qb.andWhere('status', params.status);
        }
        if (params.user_id) {
          qb.andWhere('user_id', params.user_id);
        }
        if (params.title) {
          qb.andWhere('title', 'ilike', `%${params.title}%`);
        }
        if (params.user_name) {
          qb.andWhere('first_name', 'ilike', `%${params.user_name}%`);
        }
        if (params.from_travel_date && params.to_travel_date) {
          const fromDate = new Date(params.from_travel_date).toISOString();

          // Create a Date object for to_date and add 1 day
          const toDate = new Date(params.to_travel_date);
          toDate.setDate(toDate.getDate() + 1); // Add one day

          // Set the new date to the beginning of the day (00:00:00.000)
          toDate.setUTCHours(0, 0, 0, 0);

          qb.andWhereBetween('travel_date', [fromDate, toDate.toISOString()]);
        }
      });

    const res = await Promise.all(
      data.map(async (item: any) => {
        const invoiceData = await this.db('invoice')
          .withSchema(this.BTOC_SCHEMA)
          .select('id', 'total_amount', 'due', 'invoice_number')
          .where((qb) => {
            qb.andWhere('ref_id', item.id);
          });

        return { ...item, invoices: invoiceData[0] };
      })
    );

    const total = await this.db('tour_package_booking_view')
      .withSchema(this.BTOC_SCHEMA)
      .count('id as total')
      .where((qb) => {
        if (params.status) {
          qb.andWhere('status', params.status);
        }
        if (params.user_id) {
          qb.andWhere('user_id', params.user_id);
        }
        if (params.title) {
          qb.andWhere('title', 'ilike', `%${params.title}%`);
        }
        if (params.user_name) {
          qb.andWhere('name', 'ilike', `%${params.user_name}%`);
        }
        if (params.from_travel_date && params.to_travel_date) {
          const fromDate = new Date(params.from_travel_date).toISOString();

          // Create a Date object for to_date and add 1 day
          const toDate = new Date(params.to_travel_date);
          toDate.setDate(toDate.getDate() + 1); // Add one day

          // Set the new date to the beginning of the day (00:00:00.000)
          toDate.setUTCHours(0, 0, 0, 0);

          qb.andWhereBetween('travel_date', [fromDate, toDate.toISOString()]);
        }
      });

    return {
      data: res,
      total: total[0].total,
    };
  }

  //get single booking info
  public async getSingleBookingInfo(booking_id: Number, user_id?: number) {
    const data = await this.db('tour_package_booking_view')
      .withSchema(this.BTOC_SCHEMA)
      .where({ id: booking_id })
      .select('*')
      // .andWhere((qb)=>{
      //   if(user_id){
      //     qb.andWhere("user_id",user_id)
      //   }
      // })
      .first();

    return data;
  }

  //update single booking
  public async updateSingleBooking(id: Number, payload: IUpdateBooking) {
    return await this.db('tour_package_booking')
      .withSchema(this.BTOC_SCHEMA)
      .where({ id })
      .update(payload);
  }

  //update single booking contact info
  public async updateSingleBookingContact(
    id: Number,
    payload: ICreateBookAddress
  ) {
    return await this.db('tour_package_booking_contact')
      .withSchema(this.BTOC_SCHEMA)
      .where({ booking_id: id })
      .update(payload);
  }

  //b2b
  //insert tour package book
  public async insertTourPackageBookB2B(payload: ITourPackageBooking) {
    return await this.db('tour_package_booking')
      .withSchema(this.AGENT_SCHEMA)
      .insert(payload, 'id');
  }

  //insert booking contact
  public async insertTourPackageBookContactB2B(payload: ICreateBookAddress) {
    return await this.db('tour_package_booking_contact')
      .withSchema(this.AGENT_SCHEMA)
      .insert(payload, 'id');
  }

  //get my booking history
  public async getMyBookingHistoryB2B(user_id: Number) {
    return await this.db('tour_package_booking_view')
      .withSchema(this.AGENT_SCHEMA)
      .where('user_id', user_id)
      .select('*');
  }

  //get all booking requests
  public async getAllTourPackageBookingB2B(
    params: tourPackageBookingFilterQuery
  ) {
    const data = await this.db('tour_package_booking_view')
      .withSchema(this.AGENT_SCHEMA)
      .select(
        'id as booking_id',
        'tour_id',
        'travel_date',
        'first_name as contact_name',
        'email as contact_email',
        'tour_type',
        'status',
        'title',
        'adult_price',
        'child_price',
        'traveler_adult',
        'traveler_child',
        'discount',
        'discount_type'
      )
      .where((qb) => {
        if (params.status) {
          qb.andWhere('status', params.status);
        }
        if (params.user_id) {
          qb.andWhere('user_id', params.user_id);
        }
        if (params.agency_id) {
          qb.andWhere('agency_id', params.agency_id);
        }
        if (params.title) {
          qb.andWhere('title', 'ilike', `%${params.title}%`);
        }
        if (params.user_name) {
          qb.andWhere('first_name', 'ilike', `%${params.user_name}%`);
        }
        if (params.from_travel_date && params.to_travel_date) {
          const fromDate = new Date(params.from_travel_date).toISOString();

          // Create a Date object for to_date and add 1 day
          const toDate = new Date(params.to_travel_date);
          toDate.setDate(toDate.getDate() + 1); // Add one day

          // Set the new date to the beginning of the day (00:00:00.000)
          toDate.setUTCHours(0, 0, 0, 0);


          qb.andWhereBetween('travel_date', [fromDate, toDate.toISOString()]);
        }
      })
      // .orderBy(
      //   'tp.adult_price',
      // )
      .limit(params.limit ? params.limit : 100)
      .offset(params.skip ? params.skip : 0).orderBy('id', 'desc');

    const total = await this.db('tour_package_booking_view')
      .withSchema(this.AGENT_SCHEMA)
      .count('id as total')
      .where((qb) => {
        if (params.status) {
          qb.andWhere('status', params.status);
        }
        if (params.user_id) {
          qb.andWhere('user_id', params.user_id);
        }
        if (params.title) {
          qb.andWhere('title', 'ilike', `%${params.title}%`);
        }
        if (params.agency_id) {
          qb.andWhere('agency_id', params.agency_id);
        }
        if (params.user_name) {
          qb.andWhere('name', 'ilike', `%${params.user_name}%`);
        }
        if (params.from_travel_date && params.to_travel_date) {
          const fromDate = new Date(params.from_travel_date).toISOString();

          // Create a Date object for to_date and add 1 day
          const toDate = new Date(params.to_travel_date);
          toDate.setDate(toDate.getDate() + 1); // Add one day

          // Set the new date to the beginning of the day (00:00:00.000)
          toDate.setUTCHours(0, 0, 0, 0);


          qb.andWhereBetween('travel_date', [fromDate, toDate.toISOString()]);
        }
      })
      // .orderBy(
      //   'tp.adult_price',
      // )
      .limit(params.limit ? params.limit : 100)
      .offset(params.skip ? params.skip : 0);

    return {
      data: data,
      total: total[0].total,
    };
  }

  //get single booking info
  public async getSingleBookingInfoB2B(booking_id: Number, agency_id?: number) {
    const data = await this.db('tour_package_booking_view as tp')
      .withSchema(this.AGENT_SCHEMA)
      .where({ 'tp.id': booking_id })
      .join('agency_info as ai', 'ai.id', 'tp.agency_id')
      .join('btob_user as bu', 'bu.id', 'tp.created_by')
      .select('ai.agency_name', 'tp.*', 'bu.name as created_by')
      .where((qb) => {
        if (agency_id) {
          qb.andWhere('tp.agency_id', agency_id);
        }
      })
      .first();

    return data;
  }

  //update single booking
  public async updateSingleBookingB2B(id: Number, payload: IUpdateBooking) {
    return await this.db('tour_package_booking')
      .withSchema(this.AGENT_SCHEMA)
      .update(payload)
      .where({ id })
      .returning('id');
  }

  //update single booking contact info
  public async updateSingleBookingContactB2B(
    id: Number,
    payload: ICreateBookAddress
  ) {
    return await this.db('tour_package_booking_contact')
      .withSchema(this.AGENT_SCHEMA)
      .where({ booking_id: id })
      .update(payload);
  }
}
