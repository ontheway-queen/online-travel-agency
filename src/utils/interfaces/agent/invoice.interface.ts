export interface ICreateInvoicePayload {
    agency_id: number;
    user_id?: number;
    total_amount: number;
    ref_id: number;
    ref_type: string;
    due: number;
    details?: string;
    invoice_number: string;
    due_clear_last_day?:Date | string;
  }

  export interface ICreateMoneyReceiptPayload {
    invoice_id: number;
    amount: number;
    details: string;
    user_id?: number;
  }