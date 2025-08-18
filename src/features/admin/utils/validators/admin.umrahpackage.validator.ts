import Joi, { optional } from 'joi';

export class UmrahPackageValidator {
  public createUmrahPackageBodyValidator = Joi.object({
    id: Joi.number().optional(),
    package_name: Joi.string().required(),
    description: Joi.string().optional(),
    package_details: Joi.alternatives().try(
      Joi.array()
        .items({
          id: Joi.number().optional(),
          umrah_id: Joi.number().optional(),
          details_title: Joi.string().required(),
          details_description: Joi.string().required(),
          type: Joi.string().required(),
          status: Joi.boolean().optional(),
        })
        .optional(),
      Joi.string().custom((value, helpers) => {
        try {
          const parsedDeduction = JSON.parse(value);
          return parsedDeduction;
        } catch (error) {
          return helpers.error('any.invalid');
        }
      })
    ),
    duration: Joi.number().optional(),
    is_featured: Joi.boolean().optional(),
    valid_till_date: Joi.date().optional(),
    group_size: Joi.number().optional(),
    status: Joi.boolean().optional(),
    is_deleted: Joi.boolean().optional(),
    b2b_price_per_person: Joi.number().optional(),
    b2c_price_per_person: Joi.number().optional(),
    b2b_discount: Joi.number().optional(),
    b2c_discount: Joi.number().optional(),
    b2b_discount_type: Joi.string().valid('PERCENTAGE', 'FLAT').optional(),
    b2c_discount_type: Joi.string().valid('PERCENTAGE', 'FLAT').optional(),
    journey_start_date: Joi.date().required(),
    journey_end_date: Joi.date().required(),
    itinerary: Joi.string(),
    include: Joi.string(),
    exclude: Joi.string(),
    total_accommodation: Joi.number(),
    total_destination: Joi.number(),
    meeting_point: Joi.string(),
    payment_policy: Joi.string(),
    visa_requirements: Joi.string(),
    cancellation_policy: Joi.string(),
    general_remarks: Joi.string().optional(),
    include_exclude: Joi.string().optional().allow(''),
  });

  public getAllUmrahPackageQueryValidator = Joi.object({
    title: Joi.string().allow(''),
    page: Joi.number(),
    limit: Joi.number(),
    to_date: Joi.date().optional().allow(''),
    status: Joi.boolean().optional().allow(''),
    tour_type: Joi.string().optional().allow(''),
    is_deleted: Joi.boolean().allow(''),
  });

  public updateUmrahPackageBodyValidator = Joi.object({
    id: Joi.number().optional(),
    package_name: Joi.string().required(),
    description: Joi.string().optional(),
    package_details: Joi.alternatives().try(
      Joi.array()
        .items({
          id: Joi.number().optional(),
          umrah_id: Joi.number().optional(),
          details_title: Joi.string().required(),
          details_description: Joi.string().required(),
          type: Joi.string().required(),
          status: Joi.boolean().optional(),
        })
        .optional(),
      Joi.string().custom((value, helpers) => {
        try {
          const parsedDeduction = JSON.parse(value);
          return parsedDeduction;
        } catch (error) {
          return helpers.error('any.invalid');
        }
      })
    ),
    duration: Joi.number().optional(),
    is_featured: Joi.boolean().optional(),
    valid_till_date: Joi.date().optional(),
    group_size: Joi.number().optional(),
    status: Joi.boolean().optional(),
    b2b_price_per_person: Joi.number().optional(),
    b2c_price_per_person: Joi.number().optional(),
    b2b_discount: Joi.number().optional(),
    b2c_discount: Joi.number().optional(),
    b2b_discount_type: Joi.string().valid('PERCENTAGE', 'FLAT').optional(),
    b2c_discount_type: Joi.string().valid('PERCENTAGE', 'FLAT').optional(),
    journey_start_date: Joi.date().optional(),
    journey_end_date: Joi.date().optional(),
    itinerary: Joi.string().optional(),
    include: Joi.string().optional(),
    exclude: Joi.string().optional(),
    total_accommodation: Joi.number().optional(),
    total_destination: Joi.number().optional(),
    meeting_point: Joi.string().optional(),
    remove_image: Joi.string().optional().allow(''),
    payment_policy: Joi.string().optional(),
    visa_requirements: Joi.string().optional(),
    cancellation_policy: Joi.string().optional(),
    general_remarks: Joi.string().optional(),
    remove_include_exclude: Joi.string().optional(),
    include_exclude: Joi.string().optional(),
  });

  public createDetailDescriptionBodyValidator = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    meta_title: Joi.string().optional(),
    meta_description: Joi.string().optional(),
    page: Joi.string().required(),
  });

  public umrahPackageBookingFilterQueryValidator = Joi.object({
    status: Joi.string(),
    limit: Joi.number(),
    skip: Joi.number(),
    user_id: Joi.number(),
    from_travel_date: Joi.string(),
    to_travel_date: Joi.string(),
    title: Joi.string(),
    user_name: Joi.string(),
  });

  public umrahPackageBookingUpdate = Joi.object({
    status: Joi.string().valid(
      'APPROVED',
      'CANCELLED',
      'PROCESSING',
      'PENDING'
    ),
  });
}
