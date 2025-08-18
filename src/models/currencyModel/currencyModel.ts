import { TDB } from '../../features/public/utils/types/commonTypes';
import {
  ICreateApiWiseCurrencyPayload,
  IUpdateApiWiseCurrencyPayload,
} from '../../utils/interfaces/currencyConvertionModelInterface/apiWiseCurrencyModel.interface';
import Schema from '../../utils/miscellaneous/schema';

class CurrencyModel extends Schema {
  private db: TDB;
  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async createApiWise(payload: ICreateApiWiseCurrencyPayload) {
    return await this.db('api_wise_currency')
      .withSchema(this.DBO_SCHEMA)
      .insert(payload, 'id');
  }

  public async updateApiWise(
    payload: IUpdateApiWiseCurrencyPayload,
    id: number
  ) {
    return await this.db('api_wise_currency')
      .withSchema(this.DBO_SCHEMA)
      .update(payload)
      .where({ id });
  }

  public async deleteApiWise(id: number) {
    return await this.db('api_wise_currency')
      .withSchema(this.DBO_SCHEMA)
      .delete()
      .where({ id });
  }

  public async getApiWise(query: { filter?: number }) {
    const data = await this.db('api_wise_currency as awc')
      .withSchema(this.DBO_SCHEMA)
      .select(
        'awc.id',
        'awc.api_id',
        'awc.api_currency',
        'awc.currency_value',
        'cpl.api_name',
        'awc.type'
      )
      .leftJoin('currency_api_list as cpl', 'cpl.id', 'awc.api_id')
      .where((qb) => {
        if (query.filter) {
          qb.andWhere('api_id', query.filter);
        }
      })
      .orderBy('id', 'asc');

    return data;
  }

  public async getApiList(type: 'FLIGHT' | 'HOTEL') {
    return await this.db('currency_api_list')
      .withSchema(this.DBO_SCHEMA)
      .select('id', 'api_name')
      .orderBy('id', 'asc')
      .where({ type });
  }

  public async getApiWiseCurrencyByName(
    api_name: string,
    type: 'FLIGHT' | 'HOTEL'
  ) {
    const data = await this.db('api_wise_currency as awc')
      .withSchema(this.DBO_SCHEMA)
      .leftJoin('currency_api_list as cpl', 'cpl.id', 'awc.api_id')
      .select('awc.currency_value')
      .where('cpl.api_name', api_name)
      .andWhere('awc.type', type);

    if (data.length) {
      return Number(data[0].currency_value);
    } else {
      return 1;
    }
  }
}

export default CurrencyModel;
