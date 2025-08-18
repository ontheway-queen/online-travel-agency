import { TDB } from '../../features/public/utils/types/commonTypes';
import {
  IGetBlockAirlineParams,
  IGetSetRoutesCommissionParams,
  IInsertBlockRoutePayload,
  IInsertSetRoutesCommissionPayload,
  IUpdateBlockRoutePayload,
  IUpdateSetRoutesCommissionPayload,
} from '../../utils/interfaces/common/commissionAirlinesRoutesInterface';
import Schema from '../../utils/miscellaneous/schema';

export class FlightRoutesConfigModel extends Schema {
  private db: TDB;
  constructor(db: TDB) {
    super();
    this.db = db;
  }

  // Insert set routes commission
  public async insertSetRoutesCommission(
    payload:
      | IInsertSetRoutesCommissionPayload
      | IInsertSetRoutesCommissionPayload[]
  ) {
    return await this.db('set_routes_commission')
      .withSchema(this.DBO_SCHEMA)
      .insert(payload, 'id');
  }

  // Get set routes commission
  public async getSetRoutesCommission(
    {
      arrival,
      departure,
      one_way,
      round_trip,
      status,
      limit,
      skip,
      commission_set_id,
    }: IGetSetRoutesCommissionParams,
    need_total: boolean = true
  ) {
    const data = await this.db('set_routes_commission')
      .withSchema(this.DBO_SCHEMA)
      .select('*')
      .where((qb) => {
        qb.andWhere({ commission_set_id });
        if (arrival) {
          qb.andWhere({ arrival });
        }
        if (departure) {
          qb.andWhere({ departure });
        }
        if (one_way) {
          qb.andWhere({ one_way });
        }
        if (round_trip) {
          qb.andWhere({ round_trip });
        }
        if (status) {
          qb.andWhere({ status });
        }
      })
      .limit(limit ? Number(limit) : 100)
      .offset(skip ? Number(skip) : 0);

    let total: any[] = [];

    if (need_total) {
      total = await this.db('set_routes_commission')
        .withSchema(this.DBO_SCHEMA)
        .select('id AS total')
        .where((qb) => {
          qb.andWhere({ commission_set_id });
          if (arrival) {
            qb.andWhere({ arrival });
          }
          if (departure) {
            qb.andWhere({ departure });
          }
          if (one_way) {
            qb.andWhere({ one_way });
          }
          if (round_trip) {
            qb.andWhere({ round_trip });
          }
          if (status) {
            qb.andWhere({ status });
          }
        });
    }

    return {
      data,
      total: total[0]?.total,
    };
  }

  // Update set routes commission
  public async updateSetRoutesCommission(
    payload: IUpdateSetRoutesCommissionPayload,
    id: number,
    commission_set_id: number
  ) {
    return await this.db('set_routes_commission')
      .withSchema(this.DBO_SCHEMA)
      .update(payload)
      .where({ id })
      .andWhere({ commission_set_id });
  }

  // Delete Set routes commission
  public async deleteSetRoutesCommission(
    id: number,
    commission_set_id: number
  ) {
    return await this.db('set_routes_commission')
      .withSchema(this.DBO_SCHEMA)
      .del()
      .andWhere({ id })
      .andWhere({ commission_set_id });
  }

  // Insert Block route
  public async insertBlockRoute(
    payload: IInsertBlockRoutePayload | IInsertBlockRoutePayload[]
  ) {
    return await this.db('route_block')
      .withSchema(this.DBO_SCHEMA)
      .insert(payload);
  }

  // Update block route
  public async updateBlockRoute(payload: IUpdateBlockRoutePayload, id: number) {
    return await this.db('route_block')
      .withSchema(this.DBO_SCHEMA)
      .update(payload)
      .where({ id });
  }

  // Get block route
  public async getBlockRoute(
    {
      airline,
      status,
      arrival,
      booking_block,
      departure,
      full_block,
      one_way,
      round_trip,
      limit,
      skip,
    }: IGetBlockAirlineParams,
    need_total: boolean = true
  ) {
    const data = await this.db('route_block')
      .withSchema(this.DBO_SCHEMA)
      .select('*')
      .where((qb) => {
        if (status !== undefined) {
          qb.andWhere('status', status);
        }
        if (airline) {
          qb.andWhere('airline', airline);
        }
        if (arrival && departure) {
          qb.andWhere('arrival', arrival).andWhere('departure', departure);
        }
        if (booking_block !== undefined) {
          qb.andWhere('booking_block', booking_block);
        }
        if (full_block !== undefined) {
          qb.andWhere('full_block', full_block);
        }
        if (one_way !== undefined) {
          qb.andWhere('one_way', one_way);
        }
        if (round_trip !== undefined) {
          qb.andWhere('round_trip', round_trip);
        }
      })
      .limit(limit ? Number(limit) : 100)
      .offset(skip ? Number(skip) : 0);
    let total: any[] = [];

    if (need_total) {
      total = await this.db('route_block')
        .withSchema(this.DBO_SCHEMA)
        .select('*')
        .where((qb) => {
          if (status !== undefined) {
            qb.andWhere('status', status);
          }
          if (airline) {
            qb.andWhere('airline', airline);
          }
          if (arrival && departure) {
            qb.andWhere('arrival', arrival).andWhere('departure', departure);
          }
          if (booking_block !== undefined) {
            qb.andWhere('booking_block', booking_block);
          }
          if (full_block !== undefined) {
            qb.andWhere('full_block', full_block);
          }
          if (one_way !== undefined) {
            qb.andWhere('one_way', one_way);
          }
          if (round_trip !== undefined) {
            qb.andWhere('round_trip', round_trip);
          }
        });
    }

    return { data, total: total[0]?.total };
  }

  // Delete block route
  public async deleteBlockRoute(id: number) {
    return await this.db('route_block')
      .withSchema(this.DBO_SCHEMA)
      .del()
      .where({ id });
  }
}
