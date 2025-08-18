export interface IB2BTopUpQueryInterface {
  agency_id: number;
  start_date: string;
  end_date: string;
  limit: number;
  skip: number;
}

export interface IB2bSalesQueryInterface {
  agency_id: number;
  start_date: string;
  end_date: string;
  status: string;
  limit: number;
  skip: number;
}

export interface IB2BLedgerReportQueryInterface {
  agency_id: number;
  start_date: string;
  end_date: string;
  limit: number;
  skip: number;
}

export interface IB2CTransactionQueryInterface {
  start_date: string;
  end_date: string;
  filter: string;
  limit: number;
  skip: number;
}

export interface IB2BTicketWiseQueryInterface {
  start_date: string;
  end_date: string;
  agency_id: number;
  limit: number;
  skip: number;
  filter: string;
}

export interface IB2BFlightBookingQueryInterface {
  start_date: string;
  end_date: string;
  limit: number;
  skip: number;
  filter: string;
  agency_id: number;
  status: string;
}

export interface IB2CFlightBookingQueryInterface {
  start_date: string;
  end_date: string;
  limit: number;
  skip: number;
  filter: string;
  user_id: number;
  status: string;
}