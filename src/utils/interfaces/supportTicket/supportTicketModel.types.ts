type support_type = "flight" | "hotel" | "visa" | "other" | "tour" | "umrah";
type source_type = "AGENT" | "SUB AGENT" | "AGENT B2C" | "B2C" | "EXTERNAL" | "ADMIN";
export interface ICreateSupportTicketPayload {
    support_type: support_type;
    created_by: number;
    ref_id: string;
    source_type: source_type;
    source_id?: number;
}

export interface ICreateSupportTicketMessagePayload {
    support_id: number;
    message?: string;
    attachment?: string;
    sender: "admin" | "agent";
    sender_id: number;
}

export interface IUpdateSupportTicketPayload {
  status?: "pending" | "processing" | "closed";
  closed_by?: number;
  refund_amount?: number;
  last_message_at?: Date;
  closed_at?: Date;
  adjust_at?: Date;
  adjusted_by?: number;
}