

export interface ICreateApiWiseCurrencyPayload {
    api_id: number;
    api_currency: string;
    currency_value: number;
    created_by: number;
    type: 'FLIGHT' | 'HOTEL'
}

export interface IUpdateApiWiseCurrencyPayload {
    currency_value: number;
}