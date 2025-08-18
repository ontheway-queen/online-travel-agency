export interface createAgentLoanPayload {
    agency_id: number;
    amount: number;
    details?: string;
    type: 'Loan' | 'Repayment';
    date: Date;
    loan_given_by?: number;
}

export interface IGetAgentLoanParams {
    agency_id: number;
    start_date?: string;
    end_date?: string;
    limit?: number;
    skip?: number;
    type?: string;
    search?: string;
}


export interface ICreateAgentLoanHistoryPayload {
    amount: number;
    agency_id: number;
    created_by_user_id: number;
    created_by_type: "Admin" | "Agent";
    type: "Given" | "Taken";
    details?: string;
}


export interface IGetAgentLoanHistoryQuery {
  type?: 'Given' | 'Taken';
  agency_id?: number;
  from_date?: string;
  to_date?: string;
  limit?: string;
  skip?: string;
}


export interface IGetAgentLoanData {
  id: number;
  amount: string;
  details: string;
  created_at: string;
  type: 'Given' | 'Taken';
  agency_id: number;
}

export interface ICreateLoanRequestPayload {
    amount: number;
    agency_id: number;
    created_by: number;
    details?: string;
}

export interface IGetLoanRequestFilterQuery {
    id?: number;
    limit?: number;
    skip?: number;
    status?: string;
    agency_id?: number;
    from_date?: Date;
    to_date?: Date;
}

export interface IUpdateLoanRequestPayload {
    note?: string;
    status: 'Approved' | 'Rejected';
}
