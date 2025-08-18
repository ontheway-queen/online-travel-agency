import { TDB } from '../../features/public/utils/types/commonTypes';
import {
  ICreateFlightBookingPayload,
  IInsertFlightSegmentPayload,
  IInsertFlightTravelerPayload,
} from '../../utils/interfaces/flight/flightBookingInterface';
import {
  ISpecialOfferParams,
  ISpecialOfferPayload,
} from '../../utils/interfaces/specialOffer/specialOffer.type';

import Schema from '../../utils/miscellaneous/schema';

class SpecialOfferModel extends Schema {
  private db: TDB;
  constructor(db: TDB) {
    super();
    this.db = db;
  }

  // insert speacial offer
  public async insertSpecialOffer(payload: ISpecialOfferPayload) {
    return await this.db('special_offer')
      .withSchema(this.SERVICE_SCHEMA)
      .insert(payload, 'id');
  }

  // update special offer
  public async updateSpecialOffer(
    query: { id?: number },
    payload: Partial<ISpecialOfferPayload>
  ) {
    return await this.db('special_offer AS sp')
      .withSchema(this.SERVICE_SCHEMA)
      .update(payload, 'id')
      .where((qb) => {
        if (query.id) {
          qb.andWhere('sp.id', query.id);
        }
      });
  }

  // delete single special offer
  public async deleteSingleSpecialOffer(query: { id?: number }) {
    return await this.db('special_offer AS sp')
      .withSchema(this.SERVICE_SCHEMA)
      .del('id')
      .where((qb) => {
        if (query.id) {
          qb.andWhere('sp.id', query.id);
        }
      });
  }

  // get single speacial offer
  public async getSingleSpecialOffer(query: ISpecialOfferParams) {
    const { id, panel } = query;
    return await this.db('special_offer AS sp')
      .withSchema(this.SERVICE_SCHEMA)
      .select(
        'sp.id',
        'sp.title',
        'sp.description',
        'sp.photo',
        'sp.type',
        'sp.status',
        'sp.created_by AS created_by_id',
        'sp.video',
        'sp.panel',
        this.db.raw(
          "concat(ad.first_name, ' ', ad.last_name) AS created_by_name"
        ),
        'sp.created_at'
      )
      .joinRaw('LEFT JOIN admin.user_admin AS ad ON sp.created_by = ad.id')
      .where((qb) => {
        if (id) {
          qb.andWhere('sp.id', id);
        }
        if (panel) {
          if (Array.isArray(panel)) {
            qb.whereIn('sp.panel', panel);
          } else {
            qb.andWhere('sp.panel', panel);
          }
        }
      });
  }

  //  get speacial offers
  public async getSpecialOffers(params: ISpecialOfferParams) {
    const data = this.db('special_offer AS sp')
      .withSchema(this.SERVICE_SCHEMA)
      .select(
        'sp.id',
        'sp.title',
        'sp.description',
        'sp.photo',
        'sp.type',
        'sp.status',
        'sp.video',
        'sp.created_by AS created_by_id',
        this.db.raw(
          "concat(ad.first_name, ' ', ad.last_name) AS created_by_name"
        ),
        'sp.created_at',
        "sp.panel"
      )
      .joinRaw('LEFT JOIN admin.user_admin AS ad ON sp.created_by = ad.id')
      .where((qb) => {
        if (params.key) {
          qb.andWhere((subQuery) => {
            subQuery.orWhereILike('sp.description', `%${params.key}%`);
            subQuery.orWhereILike('sp.title', `%${params.key}%`);
          });
        }
        if (params.type) {
          qb.andWhere('sp.type', params.type);
        }
        if (params.status) {
          qb.andWhere('sp.status', params.status);
        }
        if (params.panel) {
          if (Array.isArray(params.panel)) {
            qb.whereIn('sp.panel', params.panel);
          } else {
            qb.andWhere('sp.panel', params.panel);
          }
        }
      })
      .orderBy('sp.created_at', 'desc');

    if (params.limit) {
      data.limit(params.limit);
    }
    if (params.skip) {
      data.offset(params.skip);
    }

    const total = await this.db('special_offer AS sp')
      .withSchema(this.SERVICE_SCHEMA)
      .count('id as total')
      .where((qb) => {
        if (params.key) {
          qb.andWhere((subQuery) => {
            subQuery.orWhereILike('sp.description', `%${params.key}%`);
            subQuery.orWhereILike('sp.title', `%${params.key}%`);
          });
        }
        if (params.type) {
          qb.andWhere('sp.type', params.type);
        }
        if (params.status) {
          qb.andWhere('sp.status', params.status);
        }
        if (params.panel) {
          if (Array.isArray(params.panel)) {
            qb.whereIn('sp.panel', params.panel);
          } else {
            qb.andWhere('sp.panel', params.panel);
          }
        }
      });

    return {
      data: await data,
      total: total[0].total,
    };
  }
}

export default SpecialOfferModel;
