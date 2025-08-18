import Joi from "joi";
import { join } from "path";

class BookingProfileValidator {
  public editProfile = Joi.object({
    name: Joi.string().max(255),
    agency_name: Joi.string().max(255),
    agency_phone: Joi.string().max(20),
    agency_email: Joi.string().max(255),
    agency_address: Joi.string().max(255),
    mobile_number: Joi.string().max(20),
    twoFA: Joi.number().valid(0, 1),
  });
}

export default BookingProfileValidator;
