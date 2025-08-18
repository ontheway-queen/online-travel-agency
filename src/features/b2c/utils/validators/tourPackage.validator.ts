import Joi from 'joi';

class TourPackageBookingValidatorBTOC {
  public tourPackageBooking = Joi.object({
    tour_id: Joi.number().integer().positive().required(), // Required positive integer
    traveler_adult: Joi.number().integer().min(0).required(), // Required non-negative integer
    traveler_child: Joi.number().integer().min(0).optional(), // Non-negative integer
    note_from_customer: Joi.string().optional().allow(''), // Optional string
    travel_date: Joi.date().iso().required(), // Required ISO date
    double_room: Joi.number().integer().min(0), // Non-negative integer
    twin_room: Joi.number().integer().min(0), // Non-negative integer
    booking_info: Joi.object({
      first_name: Joi.string().required(),
      email: Joi.string().email().required().lowercase().trim(),
      phone: Joi.string().required(),
      address: Joi.string().optional(),
    }),
  });
  public tourPackageBookingUpdate = Joi.object({
    tour_id: Joi.number().integer().positive(), // Optional positive integer
    traveler_adult: Joi.number().integer().min(0), // Optional non-negative integer
    traveler_child: Joi.number().integer().min(0), // Optional non-negative integer
    adult_price: Joi.number().positive(), // Optional positive number
    child_price: Joi.number().positive(), // Optional positive number
    discount: Joi.number().min(0), // Optional non-negative number
    discount_type: Joi.string().valid('FLAT', 'PERCENTAGE'), // Optional, only 'FLAT' or 'PERCENTAGE'
    note_from_customer: Joi.string(), // Optional string
    travel_date: Joi.date().iso(), // Optional ISO date
    double_room: Joi.number().integer().min(0), // Optional non-negative integer
    twin_room: Joi.number().integer().min(0), // Optional non-negative integer
    status: Joi.string(), // Optional string
    booking_info: Joi.object({
      first_name: Joi.string(),
      email: Joi.string().email().lowercase().trim(),
      phone: Joi.string(),
      address: Joi.string(),
    }).optional(), // Optional object with optional fields
  });


  public tourPackageBookingUpdateB2B = Joi.object({
    status: Joi.string().valid('APPROVED', 'CANCELLED').required(),
  })
}

export default TourPackageBookingValidatorBTOC;
