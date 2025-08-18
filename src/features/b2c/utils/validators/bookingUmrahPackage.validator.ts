import Joi from 'joi';

export class BookingUmrahPackageValidator {
  public umrahPackageBookingBodySchema = Joi.object({
    umrah_id:Joi.number().required(),
    traveler_adult: Joi.number(),
    traveler_child: Joi.number().optional(),
    note_from_customer: Joi.string().optional(),
    travel_date: Joi.date(),
    double_room: Joi.number().optional().allow(''),
    twin_room: Joi.number().optional().allow(''),
    booking_info: Joi.object({
      first_name: Joi.string(),
      email: Joi.string().email().trim().lowercase(),
      phone: Joi.string(),
      address: Joi.string(),
    }).optional(),
  });

  public PackageBookingParamSchema = Joi.object({
    umrah_id: Joi.number().required(),
  });

  public customizePackageBookingBodySchema = Joi.object({
    full_name: Joi.string().required(),
    email: Joi.string().email().allow('').lowercase().trim(),
    phone: Joi.number().required(),
    address: Joi.string().allow(''),
    note: Joi.string().allow(''),
  });
}
