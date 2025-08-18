import { TDB } from '../../features/public/utils/types/commonTypes';
import {
  ICreateApiAirlinesBlock,
  IUpdateApiAirlinesBlock,
} from '../../utils/interfaces/common/apiAirlineBlock.interface';
import Schema from '../../utils/miscellaneous/schema';

export class ApiAirlinesBlockModel extends Schema {
  private db: TDB;
  constructor(db: TDB) {
    super();
    this.db = db;
  }

  //insert
  public async insert(
    payload: ICreateApiAirlinesBlock | ICreateApiAirlinesBlock[]
  ) {
    return await this.db('api_airlines_block')
      .withSchema(this.DBO_SCHEMA)
      .insert(payload, 'id');
  }

  //update
  public async update(payload: IUpdateApiAirlinesBlock, id: number) {
    return await this.db('api_airlines_block')
      .withSchema(this.DBO_SCHEMA)
      .update(payload)
      .where({ id });
  }

  //delete
  public async delete(id: number) {
    return await this.db('api_airlines_block')
      .withSchema(this.DBO_SCHEMA)
      .delete()
      .where({ id });
  }

  //get
  public async get(payload: {
    limit?: number;
    skip?: number;
    filter?: string;
    set_flight_api_id: number;
  }) {
    const data = await this.db('api_airlines_block as aab')
      .withSchema(this.DBO_SCHEMA)
      .select(
        'aab.id',
        'aab.airline as airline_code',
        'ai.name as airline_name',
        'ai.logo as airline_logo',
        'aab.issue_block',
        'aab.booking_block',
        'aab.status'
      )
      .leftJoin('airlines as ai', 'ai.code', 'aab.airline')
      .where((qb) => {
        if (payload.filter) {
          qb.andWhereILike('aab.airline', `${payload.filter}`);
          qb.orWhereILike('ai.name', `${payload.filter}%`);
        }
      })
      .andWhere('aab.set_flight_api_id', payload.set_flight_api_id)
      .limit(payload.limit || 100)
      .offset(payload.skip || 0)
      .orderBy('aab.id', 'desc');

    const total = await this.db('api_airlines_block as aab')
      .withSchema(this.DBO_SCHEMA)
      .count('aab.id as total')
      .leftJoin('airlines as ai', 'ai.code', 'aab.airline')
      .where((qb) => {
        if (payload.filter) {
          qb.andWhereILike('aab.airline', `${payload.filter}`);
          qb.orWhereILike('ai.name', `${payload.filter}%`);
        }
      });

    return { data, total: total?.[0]?.total };
  }

  //single
  public async getAirlineBlock(
    airline: string,
    set_flight_api_id: number,
    status?: boolean
  ) {
    return await this.db('api_airlines_block as aab')
      .withSchema(this.DBO_SCHEMA)
      .select(
        'aab.id',
        'aab.airline as airline_code',
        'aab.issue_block',
        'aab.booking_block',
        'aab.status'
      )
      .where('aab.airline', airline)
      .andWhere('aab.set_flight_api_id', set_flight_api_id)
      .andWhere((qb) => {
        if (status != undefined) {
          qb.andWhere('aab.status', status);
        }
      });
  }

  //check entry
  public async checkEntryExists(
    airlines: string[],
    set_flight_api_id: number
  ): Promise<boolean> {
    const result = await this.db('api_airlines_block as aab')
      .withSchema(this.DBO_SCHEMA)
      .select('aab.id')
      .whereIn('aab.airline', airlines)
      .andWhere('aab.set_flight_api_id', set_flight_api_id)
      .first();

    return !!result;
  }
}
