export interface ICreateB2BReissueRequestPayload {
    ref_no: string;
    booking_id: number;
    reason?: string;
    agency_id: number;
    created_by: number;
}

export interface IUpdateB2BReissueRequestPayload {
    status?: string;
    staff_status?: string;
    staff_id?: number;
    reissue_amount?: number;
    updated_by?: number;
}

export interface IInsertB2BReissueRequest_tickets {
    reissue_request_id: number;
    flight_booking_traveler_id: number;
}