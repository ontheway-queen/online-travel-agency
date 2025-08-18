import { TDB } from '../../features/public/utils/types/commonTypes';
import {
  ICreateCommissionSetPayload,
  ICreateSetFlightAPI,
  IUpdateSetFlightAPI,
} from '../../utils/interfaces/common/setCommission.interface';
import Schema from '../../utils/miscellaneous/schema';

export class ApiSetCommissionModel extends Schema {
  private db: TDB;
  constructor(db: TDB) {
    super();
    this.db = db;
  }

  // Create Set Commission
  public async createCommissionSet(payload: ICreateCommissionSetPayload) {
    return await this.db('commission_set')
      .withSchema(this.DBO_SCHEMA)
      .insert(payload, 'id');
  }

  // Get Set Commission
  public async getCommissionSet({
    name,
    status,
    exact_name,
  }: {
    name?: string;
    status?: boolean;
    exact_name?: string;
  }) {
    return await this.db('commission_set')
      .withSchema(this.DBO_SCHEMA)
      .select('*')
      .where((qb) => {
        if (name) {
          qb.andWhereILike('name', `%${name}%`);
        }
        if (exact_name) {
          qb.andWhere('name', exact_name);
        }
        if (status !== undefined) {
          qb.andWhere('status', status);
        }
      });
  }

  // Get single commission set
  public async getSingleCommissionSet(id: number, status?: boolean) {
    return await this.db('commission_set')
      .withSchema(this.DBO_SCHEMA)
      .select('*')
      .where((qb) => {
        qb.andWhere('id', id);
        if (status !== undefined) {
          qb.andWhere('status', status);
        }
      });
  }

  // Update commission set
  public async updateCommissionSet(
    payload: { name?: string; status?: boolean },
    id: number
  ) {
    return await this.db('commission_set')
      .withSchema(this.DBO_SCHEMA)
      .update(payload)
      .where('id', id);
  }

  // delete commission set
  public async deleteCommissionSet(id: number) {
    return await this.db('commission_set')
      .withSchema(this.DBO_SCHEMA)
      .del()
      .where('id', id);
  }

  // Create Set Flight API
  public async createSetFlightAPI(
    payload: ICreateSetFlightAPI | ICreateSetFlightAPI[]
  ) {
    return await this.db('set_flight_api')
      .withSchema(this.DBO_SCHEMA)
      .insert(payload, 'id');
  }

  // GET Set Flight API
  public async getSetFlightAPI({
    id,
    status,
    set_id,
    api_id,
    api_name,
  }: {
    id?: number;
    status?: boolean;
    set_id: number;
    api_id?: number;
    api_name?: string;
  }) {
    return await this.db('set_flight_api AS sfa')
      .withSchema(this.DBO_SCHEMA)
      .select(
        'sfa.id',
        'sfa.status',
        'sfa.api_id',
        'fa.api AS api_name',
        'fa.logo AS api_logo'
      )
      .leftJoin('supplier AS fa', 'sfa.api_id', 'fa.id')
      .where((qb) => {
        qb.andWhere('sfa.set_id', set_id);
        if (id) {
          qb.andWhere('sfa.id', id);
        }
        if (api_id) {
          qb.andWhere('sfa.api_id', api_id);
        }
        if (status !== undefined) {
          qb.andWhere('sfa.status', status);
        }
        if (api_name) {
          qb.andWhere('fa.api', api_name);
        }
      })
      .orderBy("sfa.id",'asc');
  }

  // Update set flight api
  public async updateSetFlightAPI(payload: IUpdateSetFlightAPI, id: number) {
    return await this.db('set_flight_api')
      .withSchema(this.DBO_SCHEMA)
      .update(payload)
      .where('id', id);
  }

  // Delete set flight api
  public async deleteSetFlightAPI(id: number) {
    return await this.db('set_flight_api')
      .withSchema(this.DBO_SCHEMA)
      .del()
      .where('id', id);
  }

  //get btoc commission
  public async getBtoCCommission() {
    return await this.db("btoc_commission as bc")
      .withSchema(this.DBO_SCHEMA)
      .join("commission_set as cs","cs.id","bc.commission_set_id")
      .select("bc.id", "bc.commission_set_id","cs.name");
  }

  //upsert btoc commission set
  public async upsertBtoCCommission(payload: { commission_set_id: number }) {
    const res = await this.db("btoc_commission")
      .withSchema(this.DBO_SCHEMA)
      .update(payload)

    if (!res) {
      await this.db("btoc_commission")
        .withSchema(this.DBO_SCHEMA)
        .insert(payload)
    }
  }
}
