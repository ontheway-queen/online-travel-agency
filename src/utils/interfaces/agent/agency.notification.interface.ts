export interface InsertNotificationPayload {
  message: string;
  type:
    | "b2b_booking_support"
    | "b2b_refund_request"
    | "b2b_reissue_request"
    | "loan_request";
  ref_id: number;
  agency_id: number;
}

export interface InsertNotificationSeenPayload {
  notification_id: number;
  user_id: number;
}
