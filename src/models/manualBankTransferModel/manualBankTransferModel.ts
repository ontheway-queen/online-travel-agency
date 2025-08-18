import { TDB } from '../../features/public/utils/types/commonTypes';
import {
  ICreateBankTransferPayload,
  IGetBankTransferQuery,
  IUpdateBankTransferPayload,
} from '../../utils/interfaces/btoc/manualBankTransferInteface';
import Schema from '../../utils/miscellaneous/schema';

export class ManualBankTransferModel extends Schema {
  private db: TDB;
  constructor(db: TDB) {
    super();
    this.db = db;
  }

  //create manual bank transfer
  public async createManualBankTransfer(payload: ICreateBankTransferPayload) {
    return await this.db('manual_bank_transfer')
      .withSchema(this.BTOC_SCHEMA)
      .insert(payload, 'id');
  }

  //get manual bank transfer list
  public async getManualBankTransferList(payload: IGetBankTransferQuery) {
    const data = await this.db('manual_bank_transfer as mbt')
      .withSchema(this.BTOC_SCHEMA)
      .select(
        'mbt.id',
        'mbt.amount',
        'mbt.bank_name',
        'mbt.transfer_date',
        'mbt.invoice_copy',
        'mbt.status',
        'mbt.created_at',
        'mbt.invoice_id',
        'inv.ref_type',
        'usr.username',
        'usr.first_name',
        'usr.last_name'
      )
      .where((qb) => {
        if (payload.status) {
          qb.where('mbt.status', payload.status);
        }
        if (payload.user_id) {
          qb.where('mbt.user_id', payload.user_id);
        }
        if (payload.from_date) {
          qb.where('mbt.created_at', '>=', payload.from_date);
        }
        if (payload.to_date) {
          qb.where('mbt.created_at', '<=', payload.to_date);
        }
        if (payload.amount) {
          qb.where('mbt.amount', '>=', payload.amount);
        }
      })
      .joinRaw('LEFT JOIN b2c.users as usr ON mbt.user_id = usr.id')
      .joinRaw('LEFT JOIN b2c.invoice as inv ON mbt.invoice_id = inv.id')
      .groupBy(
        'mbt.user_id',
        'mbt.id',
        'inv.id',
        'usr.username',
        'usr.first_name',
        'usr.last_name'
      )
      .orderBy('mbt.id', 'desc')
      .limit(payload.limit || 100)
      .offset(payload.skip || 0);

    const total = await this.db('manual_bank_transfer')
      .withSchema(this.BTOC_SCHEMA)
      .count('id as total')
      .where((qb) => {
        if (payload.status) {
          qb.where('status', payload.status);
        }
        if (payload.user_id) {
          qb.where('user_id', payload.user_id);
        }
        if (payload.from_date) {
          qb.where('created_at', '>=', payload.from_date);
        }
        if (payload.to_date) {
          qb.where('created_at', '<=', payload.to_date);
        }
        if (payload.amount) {
          qb.where('mbt.amount', '>=', payload.amount);
        }
      });
    return { data, total };
  }

  //get single manual bank transfer
  public async getSingleManualBankTransfer(payload: {
    id?: number;
    user_id?: number;
    invoice_id?: number;
    status?: string;
  }) {
    const data = await this.db('manual_bank_transfer')
      .withSchema(this.BTOC_SCHEMA)
      .select('*')
      .where((qb) => {
        if (payload.user_id) {
          qb.where('user_id', payload.user_id);
        }
        if (payload.id) {
          qb.where('id', payload.id);
        }
        if (payload.invoice_id) {
          qb.where('invoice_id', payload.invoice_id);
        }
        if (payload.status) {
          qb.where('status', payload.status);
        }
      });
    return data;
  }

  //update manual bank transfer
  public async updateManualBankTransfer(
    payload: IUpdateBankTransferPayload,
    id: number
  ) {
    return await this.db('manual_bank_transfer')
      .withSchema(this.BTOC_SCHEMA)
      .update(payload)
      .where({ id })
      .returning('*');
  }
}
