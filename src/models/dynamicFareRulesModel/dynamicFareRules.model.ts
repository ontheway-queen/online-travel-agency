import { TDB } from '../../features/public/utils/types/commonTypes';
import {
  ICreateDynamicFareSetPayload,
  ICreateDynamicFareSupplierPayload,
  ICreateDynamicFareTaxPayload,
  ICreateSupplierAirlinesDynamicFarePayload,
  IGetSupplierAirlinesDynamicFareData,
  IGetSupplierAirlinesDynamicFareQuery,
  IUpdateDynamicFareSetPayload,
  IUpdateDynamicFareSupplierPayload,
  IUpdateDynamicFareTaxPayload,
  IUpdateSupplierAirlinesDynamicFarePayload,
} from '../../utils/interfaces/dynamicFareRulesModelInterface/dynamicFareRulesModel.interface';
import Schema from '../../utils/miscellaneous/schema';

class DynamicFareModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  // Dynamic Fare Set
  public async createSet(payload: ICreateDynamicFareSetPayload) {
    return await this.db('dynamic_fare_set')
      .withSchema(this.DBO_SCHEMA)
      .insert(payload, 'id');
  }

  public async updateSet(id: number, payload: IUpdateDynamicFareSetPayload) {
    return await this.db('dynamic_fare_set')
      .withSchema(this.DBO_SCHEMA)
      .update(payload)
      .where({ id });
  }

  public async deleteSet(id: number) {
    return await this.db('dynamic_fare_set')
      .withSchema(this.DBO_SCHEMA)
      .delete()
      .where({ id });
  }

  public async getSets(name?: string) {
    return await this.db('dynamic_fare_set')
      .withSchema(this.DBO_SCHEMA)
      .select('id', 'name', 'created_by', 'created_at')
      .where((qb) => {
        if (name) {
          qb.andWhere({ name });
        }
      })
      .orderBy('id', 'desc');
  }

  public async getSetById(id: number) {
    return await this.db('dynamic_fare_set')
      .withSchema(this.DBO_SCHEMA)
      .select('*')
      .where({ id });
  }

  // Dynamic Fare Supplier
  public async createSupplier(payload: ICreateDynamicFareSupplierPayload) {
    return await this.db('dynamic_fare_supplier')
      .withSchema(this.DBO_SCHEMA)
      .insert(payload, 'id');
  }

  public async updateSupplier(
    id: number,
    payload: IUpdateDynamicFareSupplierPayload
  ) {
    return await this.db('dynamic_fare_supplier')
      .withSchema(this.DBO_SCHEMA)
      .update(payload)
      .where({ id });
  }

  public async deleteSupplier(id: number) {
    return await this.db('dynamic_fare_supplier')
      .withSchema(this.DBO_SCHEMA)
      .delete()
      .where({ id });
  }

  public async getSuppliers(payload: {
    set_id?: number;
    supplier_id?: number;
    status?: boolean;
    id?: number;
    api_name?: string;
    order_by?: 'asc' | 'desc';
  }): Promise<
    {
      id: number;
      set_id: number;
      supplier_id: number;
      commission: number;
      commission_type: 'PER' | 'FLAT';
      markup: number;
      markup_type: 'PER' | 'FLAT';
      status: boolean;
      segment_markup: number;
      segment_markup_type: 'PER' | 'FLAT';
      segment_commission: number;
      segment_commission_type: 'PER' | 'FLAT';
      api: string;
      logo: string;
      pax_markup: number;
    }[]
  > {
    const { set_id, supplier_id, status } = payload;
    return await this.db('dynamic_fare_supplier as dfs')
      .withSchema(this.DBO_SCHEMA)
      .select('dfs.*', 'supplier.api', 'supplier.logo')
      .leftJoin('supplier', 'supplier.id', 'dfs.supplier_id')
      .where((qb) => {
        if (set_id) {
          qb.andWhere({ set_id });
        }
        if (supplier_id) {
          qb.andWhere({ supplier_id });
        }
        if (status !== undefined) {
          qb.andWhere('dfs.status', status);
        }
        if (payload.id) {
          qb.andWhere('dfs.id', payload.id);
        }
        if (payload.api_name) {
          qb.andWhere('supplier.api', payload.api_name);
        }
      })
      .orderBy('dfs.id', payload.order_by || 'desc');
  }

  public async getSupplierById(id: number) {
    return await this.db('dynamic_fare_supplier')
      .withSchema(this.DBO_SCHEMA)
      .select('*')
      .where({ id });
  }

  // Supplier Airlines Dynamic Fare
  public async createSupplierAirlinesFare(
    payload:
      | ICreateSupplierAirlinesDynamicFarePayload
      | ICreateSupplierAirlinesDynamicFarePayload[]
  ) {
    return await this.db('supplier_airlines_dynamic_fare')
      .withSchema(this.DBO_SCHEMA)
      .insert(payload);
  }

  public async updateSupplierAirlinesFare(
    id: number,
    payload: IUpdateSupplierAirlinesDynamicFarePayload
  ) {
    return await this.db('supplier_airlines_dynamic_fare')
      .withSchema(this.DBO_SCHEMA)
      .update(payload)
      .where({ id });
  }

  public async deleteSupplierAirlinesFare(id: number) {
    return await this.db('supplier_airlines_dynamic_fare')
      .withSchema(this.DBO_SCHEMA)
      .delete()
      .where({ id });
  }

  public async getSupplierAirlinesFares(
    query: IGetSupplierAirlinesDynamicFareQuery
  ): Promise<IGetSupplierAirlinesDynamicFareData[]> {
    return await this.db('supplier_airlines_dynamic_fare')
      .withSchema(this.DBO_SCHEMA)
      .select(
        'supplier_airlines_dynamic_fare.*',
        'airlines.name as airline_name',
        'airlines.logo as airline_logo'
      )
      .joinRaw(
        `
      LEFT JOIN airlines 
      ON airlines.code = supplier_airlines_dynamic_fare.airline
    `
      )
      .where((qb) => {
        qb.andWhere('dynamic_fare_supplier_id', query.dynamic_fare_supplier_id);
        if (query.airline) {
          qb.andWhere('supplier_airlines_dynamic_fare.airline', query.airline);
        }
        if (query.flight_class) {
          qb.andWhere(
            'supplier_airlines_dynamic_fare.flight_class',
            query.flight_class
          );
        }
        if (query.from_dac !== undefined) {
          qb.andWhere('from_dac', query.from_dac);
        }
        if (query.to_dac !== undefined) {
          qb.andWhere('to_dac', query.to_dac);
        }
        if (query.soto !== undefined) {
          qb.andWhere('soto', query.soto);
        }
        if (query.domestic !== undefined) {
          qb.andWhere('domestic', query.domestic);
        }
      })
      .orderBy('supplier_airlines_dynamic_fare.id', query.order_by || 'desc');
  }

  public async getSupplierAirlinesFareById(id: number) {
    return await this.db('supplier_airlines_dynamic_fare')
      .withSchema(this.DBO_SCHEMA)
      .select('*')
      .where({ id });
  }

  // Dynamic Fare Tax
  public async createFareTax(payload: ICreateDynamicFareTaxPayload) {
    return await this.db('dynamic_fare_tax')
      .withSchema(this.DBO_SCHEMA)
      .insert(payload, 'id');
  }

  public async updateFareTax(
    id: number,
    payload: IUpdateDynamicFareTaxPayload
  ) {
    return await this.db('dynamic_fare_tax')
      .withSchema(this.DBO_SCHEMA)
      .update(payload)
      .where({ id });
  }

  public async deleteFareTax(id: number) {
    return await this.db('dynamic_fare_tax')
      .withSchema(this.DBO_SCHEMA)
      .delete()
      .where({ id });
  }

  public async getFareTaxes(query: {
    dynamic_fare_supplier_id: number;
    airline?: string;
    tax_name?: string;
    order_by?: 'asc' | 'desc';
  }) {
    return await this.db('dynamic_fare_tax')
      .withSchema(this.DBO_SCHEMA)
      .select(
        'dynamic_fare_tax.*',
        'airlines.name as airline_name',
        'airlines.logo as airline_logo'
      )
      .joinRaw(
        `
      LEFT JOIN airlines 
      ON airlines.code = dynamic_fare_tax.airline
    `
      )
      .where((qb) => {
        qb.andWhere('dynamic_fare_supplier_id', query.dynamic_fare_supplier_id);
        if (query.airline) {
          qb.andWhere('dynamic_fare_tax.airline', query.airline);
        }
        if (query.tax_name) {
          qb.andWhere('tax_name', query.tax_name);
        }
      })
      .orderBy('dynamic_fare_tax.id', query.order_by || 'desc');
  }

  public async getFareRulesConditions(query: {
    dynamic_fare_supplier_id: number;
    airline: string;
    tax_name: string;
    from_dac?: boolean;
    to_dac?: boolean;
    soto?: boolean;
    domestic?: boolean;
  }){
    return await this.db('dynamic_fare_tax')
      .withSchema(this.DBO_SCHEMA)
      .select('*')
      .where((qb) => {
        qb.andWhere('dynamic_fare_supplier_id', query.dynamic_fare_supplier_id);
        qb.andWhere('airline', query.airline);
        qb.andWhere('tax_name', query.tax_name);
        if (query.from_dac !== undefined) {
          qb.andWhere('from_dac', query.from_dac);
        }
        if (query.to_dac !== undefined) {
          qb.andWhere('to_dac', query.to_dac);
        }
        if (query.soto !== undefined) {
          qb.andWhere('soto', query.soto);
        }
        if (query.domestic !== undefined) {
          qb.andWhere('domestic', query.domestic);
        }
      })
      .andWhere('status', true);
  }

  public async getFareTaxById(id: number) {
    return await this.db('dynamic_fare_tax')
      .withSchema(this.DBO_SCHEMA)
      .select('*')
      .where({ id });
  }

  //get b2c commission
  public async getB2CCommission() {
    return await this.db('btoc_commission as bc')
      .withSchema(this.DBO_SCHEMA)
      .join('dynamic_fare_set as cs', 'cs.id', 'bc.commission_set_id')
      .select('bc.id', 'bc.commission_set_id', 'cs.name');
  }

  //upsert b2c commission set
  public async upsertB2CCommission(payload: { commission_set_id: number }) {
    const res = await this.db('btoc_commission')
      .withSchema(this.DBO_SCHEMA)
      .update(payload);

    if (!res) {
      await this.db('btoc_commission')
        .withSchema(this.DBO_SCHEMA)
        .insert(payload);
    }
  }

  //get supplier list
  public async getSupplierList(type?: string) {
    return await this.db('supplier')
      .withSchema(this.DBO_SCHEMA)
      .select('*')
      .where((qb) => {
        if (type) {
          qb.andWhere({ type });
        }
      });
  }
}

export default DynamicFareModel;
