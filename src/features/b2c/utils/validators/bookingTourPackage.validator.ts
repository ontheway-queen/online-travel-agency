import Joi from 'joi';

export class BookingTourPackageValidator {
  public fixedPackageBookingBodySchema = Joi.object({
    traveler_adult: Joi.number(),
    traveler_child: Joi.number().optional(),
    note_from_customer: Joi.string().optional().allow(''),
    travel_date: Joi.date(),
    double_room: Joi.number().optional().allow(''),
    twin_room: Joi.number().optional().allow(''),
  });

  public PackageBookingParamSchema = Joi.object({
    tour_id: Joi.number().required(),
  });

  public customizePackageBookingBodySchema = Joi.object({
    full_name: Joi.string().required(),
    email: Joi.string().email().lowercase().trim(),
    phone: Joi.number().required(),
    address: Joi.string(),
    note: Joi.string(),
  });
}
