export interface ICreateApiAirlinesBlock {
    set_flight_api_id: number;
    airline: string;
    issue_block: boolean;
    booking_block?: boolean;
    created_by?: number;
}

export interface IUpdateApiAirlinesBlock {
    airline?: string;
    issue_block?: boolean;
    booking_block?: boolean;
    status?: boolean;
    updated_at?: Date;
    updated_by?: number;
}