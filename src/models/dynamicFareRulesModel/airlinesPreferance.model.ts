import { TDB } from '../../features/public/utils/types/commonTypes';
import {
  ICreateAirlinesPreferencePayload,
  IGetAirlinesPreferenceData,
  IGetAirlinesPreferenceQuery,
  IUpdateAirlinesPreferencePayload,
} from '../../utils/interfaces/dynamicFareRulesModelInterface/airlinesPreferenceModel.interface';
import Schema from '../../utils/miscellaneous/schema';

export default class AirlinesPreferenceModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  // Airlines Preference
  public async createAirlinePreference(
    payload:
      | ICreateAirlinesPreferencePayload
      | ICreateAirlinesPreferencePayload[]
  ) {
    return await this.db('airlines_preference')
      .withSchema(this.DBO_SCHEMA)
      .insert(payload);
  }

  public async updateAirlinePreference(
    id: number,
    payload: IUpdateAirlinesPreferencePayload
  ) {
    return await this.db('airlines_preference')
      .withSchema(this.DBO_SCHEMA)
      .update(payload)
      .where({ id });
  }

  public async deleteAirlinePreference(id: number) {
    return await this.db('airlines_preference')
      .withSchema(this.DBO_SCHEMA)
      .delete()
      .where({ id });
  }

  public async getAirlinesPreferences(query: {
    dynamic_fare_supplier_id: number;
    airlines_code?: string;
    pref_type?: string;
    status?: boolean;
    filter?: string;
    order_by?: 'asc' | 'desc';
  }): Promise<IGetAirlinesPreferenceData[]> {
    return await this.db('airlines_preference')
      .withSchema(this.DBO_SCHEMA)
      .select(
        'airlines_preference.*',
        'airlines.name as airline_name',
        'airlines.logo as airline_logo'
      )
      .joinRaw(
        `
        LEFT JOIN airlines 
        ON airlines.code = airlines_preference.airlines_code
      `
      )
      .where((qb) => {
        qb.andWhere('dynamic_fare_supplier_id', query.dynamic_fare_supplier_id);
        if (query.airlines_code) {
          qb.andWhere('airlines_code', query.airlines_code);
        }
        if (query.pref_type) {
          qb.andWhere('airlines_preference.preference_type', query.pref_type);
        }
        if (query.status !== undefined) {
          qb.andWhere('airlines_preference.status', query.status);
        }

        if (query.filter) {
          qb.andWhere((qqb) => {
            qqb
              .orWhere('airlines_code', query.filter)
              .orWhereILike('airlines.name', `%${query.filter}%`);
          });
        }
      })
      .orderBy('airlines_preference.id', query.order_by || 'desc');
  }

  public async getAirlinePrefCodes(
    query: IGetAirlinesPreferenceQuery
  ): Promise<{ Code: string }[]> {
    return await this.db('airlines_preference')
      .withSchema(this.DBO_SCHEMA)
      .select('airlines_code as Code')
      .where((qb) => {
        qb.andWhere('dynamic_fare_supplier_id', query.dynamic_fare_supplier_id);
        if (query.airlines_code) {
          qb.andWhere('airlines_code', query.airlines_code);
        }
        if (query.pref_type) {
          qb.andWhere('preference_type', query.pref_type);
        }
        if (query.status !== undefined) {
          qb.andWhere('status', query.status);
        }

        if (query.from_dac !== undefined) {
          qb.andWhere('from_dac', query.from_dac);
        }

        if (query.to_dac !== undefined) {
          qb.andWhere('to_dac', query.to_dac);
        }

        if (query.domestic !== undefined) {
          qb.andWhere('domestic', query.domestic);
        }

        if (query.soto !== undefined) {
          qb.andWhere('soto', query.soto);
        }
      });
  }

  public async getAirlinePreferenceById(id: number) {
    return await this.db('airlines_preference')
      .withSchema(this.DBO_SCHEMA)
      .select('*')
      .where({ id });
  }
}
