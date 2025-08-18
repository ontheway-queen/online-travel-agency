export interface ICreateSupportPayload {
  booking_id?: number;
  user_id: number;
  support_type: string;
  created_by: number;
  is_booking_supported?: number;
}

export interface ICreateSupportTicketsPayload {
  support_id: number;
  traveler_id: number;
  ticket_number: string;
}

export interface ICreateSupportMessagePayload {
  support_id: number;
  message?: string;
  attachment?: string;
  sender: 'admin' | 'user';
  sender_id: number;
}

export interface IUpdateBookingSupportPayload {
  status?: 'pending' | 'processing' | 'closed';
  closed_by?: number;
  refund_amount?: number;
  last_message_at?: Date;
  closed_at?: Date;
  adjust_at?: Date;
  adjusted_by?: number;
}
