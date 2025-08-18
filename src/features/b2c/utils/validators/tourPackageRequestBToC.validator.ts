import Joi from "joi";

class TourPackageRequestBToCValidator {
  public createTourPackageRequest = Joi.object({
    tour_package_id: Joi.number().integer().positive().required(),
    request_city_id: Joi.number().integer().required(),
    request_date: Joi.date().iso().required(),
    user_first_name: Joi.string().required(),
    user_last_name: Joi.string().required(),
    user_email: Joi.string().email().required().lowercase().trim(),
    user_phone: Joi.string().required(),
    requirements: Joi.string().required(),
  });

  public updateTourPackageRequest = Joi.object({
    request_city_id: Joi.number().integer().optional(),
    request_date: Joi.date().iso().optional(),
    user_first_name: Joi.string().optional(),
    user_last_name: Joi.string().optional(),
    user_email: Joi.string().email().optional().lowercase().trim(),
    user_phone: Joi.string().optional(),
    requirements: Joi.string().optional(),
    status: Joi.string().valid("PENDING", "APPROVED"),
  });

  // get tour package requests
  public getTourPackageRequest = Joi.object({
    tour_package_id: Joi.number().optional(),
    request_city_id: Joi.number().optional(),
    requirements: Joi.string().optional(),
    limit: Joi.number().optional(),
    skip: Joi.number().optional(),
    start_date: Joi.date().optional(),
    end_date: Joi.date().optional(),
    key: Joi.string().optional(),
  });
}

export default TourPackageRequestBToCValidator;
