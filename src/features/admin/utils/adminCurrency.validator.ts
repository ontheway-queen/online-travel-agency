import Joi from "joi";

export class AdminCurrencyValidator {

    public createApiWiseCurrency = Joi.object({
        api_id: Joi.number().required(),
        api_currency: Joi.string().required(),
        currency_value: Joi.number().required(),
        type: Joi.string().valid('FLIGHT', 'HOTEL').required()
    })

    public updateApiWiseCurrency = Joi.object({
        currency_value: Joi.number()
    })

    public getApiListFilter = Joi.object({
        type: Joi.string().valid('FLIGHT', 'HOTEL').required()
    })

}