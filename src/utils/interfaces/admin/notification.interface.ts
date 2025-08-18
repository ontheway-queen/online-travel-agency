export interface InsertNotificationPayload {
  message: string;
  type:
    | "b2b_flight_booking"
    | "b2c_flight_booking"
    | "b2b_visa_application"
    | "b2c_visa_application"
    | "b2b_tour_booking"
    | "b2c_tour_booking"
    | "b2b_booking_support"
    | "b2c_booking_support"
    | "b2c_bank_transfer"
    | "b2b_deposit_request"
    | "b2b_refund_request"
    | "b2b_reissue_request"
    | "loan_request";
  ref_id: number;
}

export interface InsertNotificationSeenPayload {
  notification_id: number;
  user_id: number;
}
