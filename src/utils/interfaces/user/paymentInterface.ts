
export interface ICreateInvoicePayload {
    user_id: number;
    total_amount: number;
    ref_id?: number;
    ref_type?: string;
    due: number;
    details?: string;
    invoice_number: string;

  }

export interface ICreatePaymentTryPayload {
    booking_id: number;
    pnr_id?: string;
    user_id: number;
    status: string;
    description?: string;
    amount: number;
    currency: string;
}
export interface IUpdatePaymentTryPayload {
    status: string;
    description?: string;
}