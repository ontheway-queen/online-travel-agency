export interface ICreateBankTransferPayload {
  user_id: number;
  invoice_id: number;
  amount: number;
  bank_name: string;
  account_name?: string;
  account_number?: string;
  transfer_date?: Date;
}

export interface IGetBankTransferQuery {
  limit?: number;
  skip?: number;
  user_id?: number;
  from_date?: Date;
  to_date?: Date;
  status?: string;
  amount?: number;
}

export interface IUpdateBankTransferPayload {
  amount?: number;
  bank_name?: string;
  account_name?: string;
  account_number?: string;
  transfer_date?: Date;
  status?: string;
}

export interface IManualBankTransfer {
  id?: number;
  user_id?: number;
  invoice_id?: number;
  status?: string;
}
