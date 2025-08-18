import { TDB } from '../../features/public/utils/types/commonTypes';
import {
  ICreateAppTrackingPayload,
  ICreateAppTravelerPayload,
  ICreateB2CApplicationPayload,
  ICreateB2BApplicationPayload,
  ICreateVisaPayload,
  IGetApplicationQuery,
  IGetVisaQuery,
  IUpdateVisaPayload,
  IGetB2BApplicationQuery,
} from '../../utils/interfaces/visa/visa.interface';
import Schema from '../../utils/miscellaneous/schema';

export class VisaModel extends Schema {
  private db: TDB;
  constructor(db: TDB) {
    super();
    this.db = db;
  }

  //create visa
  public async create(payload: ICreateVisaPayload) {
    return await this.db('visa')
      .withSchema(this.SERVICE_SCHEMA)
      .insert(payload, 'id');
  }

  public async deleteApplication(id: number) {
    return await this.db('visa')
      .withSchema(this.SERVICE_SCHEMA)
      .del()
      .where({ id });
  }

  //get all visa country
  public async getAllVisaCountryList(query: IGetVisaQuery) {
    const data = await this.db('public.country as con')
      .select('con.id', 'con.name', 'con.iso')
      .join('services.visa as vi', 'con.id', 'vi.country_id')
      .groupBy('con.id');

    const total = await this.db('public.country as con')
      .countDistinct('con.id as total')
      .join('services.visa as vi', 'con.id', 'vi.country_id');

    return {
      data,
      total: total[0]?.total,
    };
  }

  //get visa
  public async get(query: IGetVisaQuery, is_total: boolean = false) {
    const data = await this.db('services.visa as vi')
      .select(
        'vi.id',
        'vi.country_id',
        'con.name as country_name',
        'vi.visa_fee',
        'vi.processing_fee',
        'vi.type',
        'vi.max_validity',
        'vi.description',
        'vi.stay_validity',
        'vi.processing_type',
        'vi.status',
        'vi.image as file'
      )
      .join('public.country as con', 'vi.country_id', 'con.id')
      .where((qb) => {
        if (query.country_id) {
          qb.andWhere('vi.country_id', query.country_id);
        }
        if (query.status !== undefined) {
          qb.andWhere('vi.status', query.status);
        }
        if (query.visa_type) {
          qb.andWhereILike('vi.type', `%${query.visa_type}%`);
        }
      })
      .orderBy('vi.id', 'desc')
      .limit(query.limit || 100)
      .offset(query.skip || 0);

    let total: any[] = [];

    if (is_total) {
      total = await this.db('services.visa as vi')
        .count('vi.id as total')
        .join('public.country as con', 'vi.country_id', 'con.id')
        .where((qb) => {
          if (query.country_id) {
            qb.andWhere('vi.country_id', query.country_id);
          }
          if (query.status !== undefined) {
            qb.andWhere('vi.status', query.status);
          }
        });
    }

    return {
      data,
      total: total[0]?.total,
    };
  }

  //get single visa
  public async single(id: number, status?: boolean) {
    return this.db('services.visa as vi')
      .select(
        'vi.id',
        'vi.country_id',
        'con.name as country_name',
        'con.iso',
        'visa_fee',
        'processing_fee',
        'max_validity',
        'type',
        'description',
        'stay_validity',
        'visa_mode',
        'processing_type',
        'documents_details',
        'status',
        'image as file',
        'required_fields'
      )
      .join('public.country as con', 'con.id', 'vi.country_id')
      .where('vi.id', id)
      .andWhere((qb) => {
        if (status !== undefined) {
          qb.andWhere('vi.status', status);
        }
      });
  }

  //update
  public async update(payload: IUpdateVisaPayload, id: number) {
    return this.db('visa')
      .withSchema(this.SERVICE_SCHEMA)
      .update(payload)
      .where({ id });
  }

  //----B2C application----//
  //create app
  public async b2cCreateApplication(payload: ICreateB2CApplicationPayload) {
    return this.db('visa_application')
      .withSchema(this.BTOC_SCHEMA)
      .insert(payload, '*');
  }

  //update b2c visa application
  public async b2cUpdateApplication(status: string, id: number) {
    return this.db('visa_application')
      .withSchema(this.BTOC_SCHEMA)
      .update({ status })
      .where({ id });
  }

  //create traveler
  public async b2cCreateTraveler(
    payload: ICreateAppTravelerPayload | ICreateAppTravelerPayload[]
  ) {
    return this.db('visa_application_traveller')
      .withSchema(this.BTOC_SCHEMA)
      .insert(payload, 'id');
  }

  //create tracking
  public async b2cCreateTracking(payload: ICreateAppTrackingPayload) {
    return this.db('visa_application_tracking')
      .withSchema(this.BTOC_SCHEMA)
      .insert(payload, 'id');
  }

  //get app
  public async getB2CApplication(
    query: IGetApplicationQuery,
    is_total: boolean = false
  ) {
    const data = await this.db('visa_application as va')
      .withSchema(this.BTOC_SCHEMA)
      .select(
        'va.id',
        'va.user_id',
        'us.username',
        'us.first_name',
        'us.last_name',
        'va.visa_id',
        'visa.max_validity',
        'visa.type',
        'visa.description',
        'va.from_date',
        'va.to_date',
        'va.traveler',
        'va.visa_fee',
        'va.processing_fee',
        'va.payable',
        'va.application_date',
        'va.contact_email',
        'va.contact_number',
        'va.booking_ref',
        'con.name as country_name'
      )
      .join('users as us', 'us.id', 'va.user_id')
      .joinRaw('join services.visa on visa.id = va.visa_id')
      .joinRaw('join public.country as con on con.id = visa.country_id')
      .where((qb) => {
        if (query.user_id) {
          qb.andWhere('va.user_id', query.user_id);
        }
        if (query.filter) {
          qb.andWhere((qbc) => {
            qbc.whereILike('us.username', `%${query.filter}%`);
            qbc.orWhereILike('va.contact_email', `%${query.filter}%`);
            qbc.orWhereILike('va.contact_number', `%${query.filter}%`);
            qbc.orWhereRaw(
              "LOWER(us.first_name || ' ' || us.last_name) LIKE LOWER(?)",
              [
                `%${query.filter ? query.filter.toLocaleLowerCase() : undefined
                }%`,
              ]
            );
          });
        }
        if (query.from_date && query.to_date) {
          qb.andWhereBetween('va.application_date', [
            query.from_date,
            query.to_date,
          ]);
        }
      })
      .orderBy('va.id', 'desc')
      .limit(query.limit || 100)
      .offset(query.skip || 0);

    let total: any[] = [];
    if (is_total) {
      total = await this.db('visa_application as va')
        .withSchema(this.BTOC_SCHEMA)
        .count('va.id as total')
        .join('users as us', 'us.id', 'va.user_id')
        .where((qb) => {
          if (query.user_id) {
            qb.andWhere('va.user_id', query.user_id);
          }
          if (query.filter) {
            qb.andWhere((qbc) => {
              qbc.whereILike('us.username', `%${query.filter}%`);
              qbc.orWhereILike('va.contact_email', `%${query.filter}%`);
              qbc.orWhereILike('va.contact_number', `%${query.filter}%`);
              qbc.orWhereRaw(
                "LOWER(us.first_name || ' ' || us.last_name) LIKE LOWER(?)",
                [
                  `%${query.filter ? query.filter.toLocaleLowerCase() : undefined
                  }%`,
                ]
              );
            });
          }
          if (query.from_date && query.to_date) {
            qb.andWhereBetween('va.application_date', [
              query.from_date,
              query.to_date,
            ]);
          }
        });
    }
    return { data, total: total[0]?.total };
  }

  public async getSingleUserVisaApplication(query: { user_id: number }) {
    const data = await this.db('visa_application as va')
      .withSchema(this.BTOC_SCHEMA)
      .select(
        'va.id',
        'va.visa_id',
        'visa.max_validity',
        'visa.type',
        'va.traveler',
        'va.visa_fee',
        'va.processing_fee',
        'va.payable',
        'va.application_date',
        'va.status',
        'va.booking_ref'
      )
      .leftJoin('users as us', 'us.id', 'va.user_id')
      .joinRaw('left join services.visa on visa.id = va.visa_id')
      .where((qb) => {
        if (query.user_id) {
          qb.andWhere('va.user_id', query.user_id);
        }
      })
      .orderBy('va.id', 'desc');

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

    let total: any[] = [];
    total = await this.db('visa_application as va')
      .withSchema(this.BTOC_SCHEMA)
      .count('va.id as total')
      .join('users as us', 'us.id', 'va.user_id')
      .where((qb) => {
        if (query.user_id) {
          qb.andWhere('va.user_id', query.user_id);
        }
      });

    return { res, total: total[0]?.total };
  }

  //single application
  public async b2cSingleApplication(id: number, user_id?: number) {
    const visaApplicationData = await this.db('visa_application as va')
      .withSchema(this.BTOC_SCHEMA)
      .select(
        'va.id',
        'va.user_id',
        'us.username',
        'us.first_name',
        'us.last_name',
        'us.email',
        'va.visa_id',
        'visa.max_validity',
        'visa.type',
        'visa.description',
        'va.from_date',
        'va.to_date',
        'va.traveler',
        'va.visa_fee',
        'va.processing_fee',
        'va.payable',
        'va.application_date',
        'va.contact_email',
        'va.contact_number',
        'va.whatsapp_number',
        'visa.country_id',
        'va.booking_ref',
        'con.name as country_name'
      )
      .join('users as us', 'us.id', 'va.user_id')
      .joinRaw('join services.visa on visa.id = va.visa_id')
      .joinRaw('join public.country as con on con.id = visa.country_id')
      .where('va.id', id)
      .andWhere((qb) => {
        if (user_id) {
          qb.andWhere('va.user_id', user_id);
        }
      })
      .first();

    if (!visaApplicationData) return null;

    const countryData = await this.db('country as con')
      .withSchema(this.PUBLIC_SCHEMA)
      .select('name', 'iso')
      .where('id', visaApplicationData.country_id)
      .first();

    return {
      ...visaApplicationData,
      country_name: countryData ? countryData.name : null,
      country_iso: countryData ? countryData.iso : null,
    };
  }

  //traveler list
  public async b2cTravelerList(id: number) {
    return await this.db('visa_application_traveller as vat')
      .withSchema(this.BTOC_SCHEMA)
      .select(
        'vat.id',
        'title',
        'first_name',
        'last_name',
        'type',
        'date_of_birth',
        'passport_number',
        'passport_expiry_date',
        'city',
        'con.name as country_name',
        'address',
        'passport_type',
        'vat.type',
        'vat.required_fields'
      )

      .joinRaw('left Join public.country as con on con.id = vat.country_id')
      .where('vat.application_id', id)
      .orderBy('vat.id', 'asc');
  }

  //tracking list
  public async b2cTrackingList(id: number) {
    return await this.db('visa_application_tracking')
      .withSchema(this.BTOC_SCHEMA)
      .select('id', 'status', 'details', 'created_date')
      .where('application_id', id)
      .orderBy('id', 'asc');
  }
  //----B2C application----//

  //----B2B application----//
  //create app
  public async b2bCreateApplication(payload: ICreateB2BApplicationPayload) {
    return this.db('visa_application')
      .withSchema(this.AGENT_SCHEMA)
      .insert(payload, 'id');
  }

  //create traveler
  public async b2bCreateTraveler(
    payload: ICreateAppTravelerPayload | ICreateAppTravelerPayload[]
  ) {
    return this.db('visa_application_traveller')
      .withSchema(this.AGENT_SCHEMA)
      .insert(payload, 'id');
  }

  //create tracking
  public async b2bCreateTracking(payload: ICreateAppTrackingPayload | ICreateAppTrackingPayload[]) {
    return this.db('visa_application_tracking')
      .withSchema(this.AGENT_SCHEMA)
      .insert(payload, 'id');
  }

  //get app
  public async getB2BApplication(
    query: IGetB2BApplicationQuery,
    is_total: boolean = false
  ) {
    const data = await this.db('agent.visa_application as va')
      .select(
        'va.id',
        'va.agent_id',
        'va.agency_id',
        'ai.agency_name',
        'ai.agency_logo',
        'bu.name as agent_name',
        'va.visa_id',
        'visa.max_validity',
        'visa.type',
        'visa.description',
        'va.from_date',
        'va.to_date',
        'va.traveler',
        'va.visa_fee',
        'va.processing_fee',
        'va.payable',
        'va.application_date',
        'va.contact_email',
        'va.contact_number',
        'va.booking_ref',
        'con.name as country_name'
      )
      .join('agent.agency_info as ai', 'ai.id', 'va.agency_id')
      .join('agent.btob_user as bu', 'bu.id', 'va.agent_id')
      .join('services.visa', 'visa.id', 'va.visa_id')
      .join('public.country as con', 'con.id', 'visa.country_id')
      .where((qb) => {
        if (query.agent_id) {
          qb.andWhere('va.agent_id', query.agent_id);
        }
        if (query.filter) {
          qb.andWhere((qbc) => {
            qbc.whereILike('ai.agency_name', `%${query.filter}%`);
            qbc.orWhereILike('va.contact_email', `%${query.filter}%`);
            qbc.orWhereILike('va.contact_number', `%${query.filter}%`);
            qbc.orWhereILike('bu.name', `%${query.filter}%`);
          });
        }
        if (query.from_date && query.to_date) {
          qb.andWhereBetween('va.application_date', [
            query.from_date,
            query.to_date,
          ]);
        }
      })
      .orderBy('va.id', 'desc')
      .limit(query.limit || 100)
      .offset(query.skip || 0);

    let total: any[] = [];
    if (is_total) {
      total = await this.db('agent.visa_application as va')
        .count('va.id as total')
        .join('agent.agency_info as ai', 'ai.id', 'va.agency_id')
        .join('agent.btob_user as bu', 'bu.id', 'va.agent_id')
        .where((qb) => {
          if (query.agent_id) {
            qb.andWhere('va.agent_id', query.agent_id);
          }
          if (query.filter) {
            qb.andWhere((qbc) => {
              qbc.whereILike('ai.agency_name', `%${query.filter}%`);
              qbc.orWhereILike('va.contact_email', `%${query.filter}%`);
              qbc.orWhereILike('va.contact_number', `%${query.filter}%`);
              qbc.orWhereILike('bu.name', `%${query.filter}%`);
            });
          }
          if (query.from_date && query.to_date) {
            qb.andWhereBetween('va.application_date', [
              query.from_date,
              query.to_date,
            ]);
          }
        });
    }
    return { data, total: total[0]?.total };
  }

  //single application
  public async b2bSingleApplication(id: number, agent_id?: number) {
    return await this.db('agent.visa_application as va')
      .select(
        'va.id',
        'va.agent_id',
        'va.agency_id',
        'ai.agency_name',
        'ai.agency_logo',
        'bu.name as agent_name',
        'va.visa_id',
        'visa.max_validity',
        'visa.type',
        'visa.description',
        'va.from_date',
        'va.to_date',
        'va.traveler',
        'va.visa_fee',
        'va.processing_fee',
        'va.payable',
        'va.application_date',
        'va.contact_email',
        'va.contact_number',
        'va.whatsapp_number',
        'va.booking_ref',
        'con.name as country_name'
      )
      .join('agent.agency_info as ai', 'ai.id', 'va.agency_id')
      .join('agent.btob_user as bu', 'bu.id', 'va.agent_id')
      .join('services.visa', 'visa.id', 'va.visa_id')
      .join('public.country as con', 'con.id', 'visa.country_id')
      .where('va.id', id)
      .andWhere((qb) => {
        if (agent_id) {
          qb.andWhere('va.agent_id', agent_id);
        }
      });
  }

  //traveler list
  public async b2bTravelerList(id: number) {
    return await this.db('agent.visa_application_traveller as vat')
      .select(
        'vat.id',
        'title',
        'first_name',
        'last_name',
        'type',
        'date_of_birth',
        'passport_number',
        'passport_expiry_date',
        'city',
        'con.name as country_name',
        'address',
        'passport_type',
        'vat.type',
        "vat.required_fields"
      )
      .leftJoin('public.country as con', 'con.id', 'vat.country_id')
      .where('vat.application_id', id)
      .orderBy('vat.id', 'asc');
  }

  //tracking list
  public async b2bTrackingList(id: number) {
    return await this.db('visa_application_tracking')
      .withSchema(this.AGENT_SCHEMA)
      .select('id', 'status', 'details', 'created_date')
      .where('application_id', id)
      .orderBy('id', 'asc');
  }
  //----B2B application----//

  // create visa type
  public async insertVisaType(payload: any) {
    return await this.db('visa_type')
      .insert(payload)
      .withSchema(this.SERVICE_SCHEMA);
  }

  // get all visa type
  public async getAllVisaType() {
    return await this.db('visa_type')
      .withSchema(this.SERVICE_SCHEMA)
      .select('id', 'name');
  }

  // delete  visa type
  public async deleteVisaType(id: number) {
    return await this.db('visa_type')
      .withSchema(this.SERVICE_SCHEMA)
      .del()
      .where({ id });
  }

  // create visa mode
  public async insertVisaMode(payload: any) {
    return await this.db('visa_mode')
      .insert(payload)
      .withSchema(this.SERVICE_SCHEMA);
  }

  // get all visa mode
  public async getAllVisaMode() {
    return await this.db('visa_mode')
      .withSchema(this.SERVICE_SCHEMA)
      .select('id', 'name');
  }

  // delete  visa mode
  public async deleteVisaMode(id: number) {
    return await this.db('visa_mode')
      .withSchema(this.SERVICE_SCHEMA)
      .del()
      .where({ id });
  }
}
