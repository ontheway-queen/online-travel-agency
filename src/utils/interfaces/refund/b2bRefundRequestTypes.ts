export interface ICreateB2BRefundRequestPayload {
    ref_no: string;
    booking_id: number;
    reason?: string;
    agency_id: number;
    created_by: number;
}

export interface IUpdateB2BRefundRequestPayload {
    status?: string;
    staff_status?: string;
    staff_id?: number;
    refund_amount?: number;
    updated_by?: number;
}

export interface IInsertB2BRefundRequest_tickets {
    refund_request_id: number;
    flight_booking_traveler_id: number;
}