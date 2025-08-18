import Joi from 'joi';

class AdminConfigValidator {
    //create city
    public createCityValidator = Joi.object({
        country_id: Joi.number().required(),
        name: Joi.string().required(),
        code: Joi.string().required(),
    });
}

export default AdminConfigValidator;
