export interface ICreateDealCodePayload {
    deal_code: string;
    api: string;
    created_by: number;
}

export interface IUpdateDealCodePayload {
    deal_code?: string;
    status?: boolean;
}

export interface IGetDealCodeQueryFilter {
    api?: string;
    status?: boolean;
    deal_code?: string;
    limit?: number;
    skip?: number;
}