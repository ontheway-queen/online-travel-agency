import Joi, { CustomHelpers } from "joi";

export class TourPackageValidator {
  public tourPackage = Joi.object({
    city_id: Joi.number().integer().required(),
    title: Joi.string().required(),
    details: Joi.string().required(),
    tour_type: Joi.string().required(),
    duration: Joi.number().integer().min(1).required(),
    adult_price: Joi.number().positive().required(),
    child_price: Joi.number().positive().required(),
    discount: Joi.number().positive().optional().default(0),
    discount_type: Joi.string().optional(),
    valid_till_date: Joi.date().required(),
    group_size: Joi.number().integer().min(1).required(),
    include_exclude: Joi.string()
      // .items(
      //   Joi.object({
      //     type: Joi.string().valid('INCLUDED', 'EXCLUDED').required(),
      //     title: Joi.string().required(),
      //   })
      // )
      .required(),
    tour_package_itinerary: Joi.string()
      // .custom((value: string, helper: CustomHelpers) => {})
      // .required()
      // .items(
      //   Joi.object({
      //     day: Joi.string().required(),
      //     title: Joi.string().required(),
      //     details: Joi.string().required(),
      //   })
      // )
      .required(),
    tour_package_photos: Joi.string()
      // .items(
      //   Joi.object({
      //     details: Joi.string().required(),
      //   })
      // )
      .required(),
    photos: Joi.array().items(Joi.string().required()).min(1), // This handles photo_1, photo_2, etc.
    itn_photos: Joi.array().items(Joi.string().required()).min(1), // This handles itn_photo_1, itn_photo_2, etc.
  });
  public tourPackageUpdate = Joi.object({
    city_id: Joi.number().integer().optional(),
    title: Joi.string().optional(),
    delete_itinerary_photo: Joi.string().optional(),
    delete_include_exclude: Joi.string().optional(),
    delete_tour_photo: Joi.string().optional(),
    details: Joi.string().optional(),
    tour_type: Joi.string().optional(),
    duration: Joi.number().integer().min(1).optional(),
    adult_price: Joi.number().positive().optional(),
    child_price: Joi.number().positive().optional(),
    discount: Joi.number().positive().optional().default(0).optional(),
    discount_type: Joi.string().optional(),
    valid_till_date: Joi.date().optional(),
    group_size: Joi.number().integer().min(1).optional(),
    include_exclude: Joi.string()
      // .items(
      //   Joi.object({
      //     type: Joi.string().valid('INCLUDED', 'EXCLUDED').required(),
      //     title: Joi.string().required(),
      //   })
      // )
      .optional(),
    tour_package_itinerary: Joi.string()
      // .items(
      //   Joi.object({
      //     day: Joi.string().required(),
      //     title: Joi.string().required(),
      //     details: Joi.string().required(),
      //   })
      // )
      .optional(),
    tour_package_photos: Joi.string()
      // .items(
      //   Joi.object({
      //     details: Joi.string().required(),
      //   })
      // )
      .optional(),
    photos: Joi.array().items(Joi.string().optional()).min(1), // This handles photo_1, photo_2, etc.
    itn_photos: Joi.array().items(Joi.string().optional()).min(1), // This handles itn_photo_1, itn_photo_2, etc.
  });

  public tourPackageFilterQueryValidator = Joi.object({
    title: Joi.string(),
    country_id: Joi.number(),
    city_id: Joi.number(),
    tour_type: Joi.string(),
    valid_till_date: Joi.date(),
    is_featured: Joi.boolean(),
    from_range: Joi.string(),
    sort_by: Joi.string(),
    from_date: Joi.string(),
    to_date: Joi.string(),
    to_range: Joi.string(),
    status: Joi.boolean(),
    limit: Joi.number(),
    skip: Joi.number(),
  });

  public tourPackageBookingFilterQueryValidator = Joi.object({
    status: Joi.string(),
    limit: Joi.number(),
    skip: Joi.number(),
    user_id: Joi.number(),
    from_travel_date: Joi.string(),
    to_travel_date: Joi.string(),
    title: Joi.string(),
    user_name: Joi.string(),
  });

  public closeBookingSupport = Joi.object({
    status: Joi.string(),
  });

  //create tour package schema version 2
  public createTourPackageSchemaV2 = Joi.object({
    city_id: Joi.number().integer().required(),
    type: Joi.string().valid("b2b", "b2c", "both").required(),
    title: Joi.string().required(),
    details: Joi.string().optional(),
    tour_type: Joi.string().valid("international", "domestic").required(),
    duration: Joi.number().integer().min(1).required(),
    b2b_adult_price: Joi.number().positive().required(),
    b2c_adult_price: Joi.number().positive().required(),
    b2b_child_price: Joi.number().positive().optional(),
    b2c_child_price: Joi.number().positive().optional(),
    b2b_discount: Joi.number().min(0).optional().default(0),
    b2c_discount: Joi.number().min(0).optional().default(0),
    b2b_discount_type: Joi.string()
      .valid("PERCENTAGE", "FLAT")
      .when("b2b_discount", {
        is: Joi.number().default(0),
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
    b2c_discount_type: Joi.string()
      .valid("PERCENTAGE", "FLAT")
      .when("b2c_discount", {
        is: Joi.number().default(0),
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
    valid_till_date: Joi.date().required(),
    group_size: Joi.number().integer().min(1).required(),
    include_services: Joi.alternatives()
      .try(
        Joi.array().items(Joi.string().required()).required(),
        Joi.string().custom((value, helpers) => {
          try {
            const parsedDeduction = JSON.parse(value);
            return parsedDeduction;
          } catch (error) {
            console.error("Error parsing include services field:", error);
            return helpers.error("any.invalid");
          }
        })
      )
      .optional(),
    exclude_services: Joi.alternatives()
      .try(
        Joi.array().items(Joi.string().required()).required(),
        Joi.string().custom((value, helpers) => {
          try {
            const parsedDeduction = JSON.parse(value);
            return parsedDeduction;
          } catch (error) {
            console.error("Error parsing exclude services field:", error);
            return helpers.error("any.invalid");
          }
        })
      )
      .optional(),
    highlights: Joi.alternatives()
      .try(
        Joi.array().items(Joi.string().required()).required(),
        Joi.string().custom((value, helpers) => {
          try {
            const parsedDeduction = JSON.parse(value);
            return parsedDeduction;
          } catch (error) {
            console.error("Error parsing highlights field:", error);
            return helpers.error("any.invalid");
          }
        })
      )
      .optional(),
    itinerary: Joi.string().required(),
    cancellation_policy: Joi.string().optional(),
    tax: Joi.string().optional(),
    general_condition: Joi.string().optional(),
    installment: Joi.string().optional(),
  });

  //update tour package schema version 2
  public updateTourPackageSchemaV2 = Joi.object({
    city_id: Joi.number().integer().optional(),
    type: Joi.string().valid("b2b", "b2c", "both").optional(),
    title: Joi.string().optional(),
    details: Joi.string().optional(),
    tour_type: Joi.string().valid("international", "domestic").optional(),
    duration: Joi.number().integer().min(1).optional(),
    b2b_adult_price: Joi.number().positive().optional(),
    b2c_adult_price: Joi.number().positive().optional(),
    b2b_child_price: Joi.number().positive().optional(),
    b2c_child_price: Joi.number().positive().optional(),
    b2b_discount: Joi.number().positive().optional().default(0),
    b2c_discount: Joi.number().positive().optional().default(0),
    b2b_discount_type: Joi.string().valid("PERCENTAGE", "FLAT").optional(),
    b2c_discount_type: Joi.string().valid("PERCENTAGE", "FLAT").optional(),
    valid_till_date: Joi.date().optional(),
    group_size: Joi.number().integer().min(1).optional(),
    // include_services: Joi.alternatives()
    //   .try(
    //     Joi.array().items(Joi.string().required()).required(),
    //     Joi.string().custom((value, helpers) => {
    //       try {
    //         const parsedDeduction = JSON.parse(value);
    //         return parsedDeduction;
    //       } catch (error) {
    //         console.error("Error parsing include services field:", error);
    //         return helpers.error("any.invalid");
    //       }
    //     })
    //   ).required(),
    // exclude_services: Joi.alternatives()
    //   .try(
    //     Joi.array().items(Joi.string().required()).required(),
    //     Joi.string().custom((value, helpers) => {
    //       try {
    //         const parsedDeduction = JSON.parse(value);
    //         return parsedDeduction;
    //       } catch (error) {
    //         console.error("Error parsing exclude services field:", error);
    //         return helpers.error("any.invalid");
    //       }
    //     })
    //   ).required(),
    // highlights: Joi.alternatives()
    //   .try(
    //     Joi.array().items(Joi.string().required()).required(),
    //     Joi.string().custom((value, helpers) => {
    //       try {
    //         const parsedDeduction = JSON.parse(value);
    //         return parsedDeduction;
    //       } catch (error) {
    //         console.error("Error parsing highlights field:", error);
    //         return helpers.error("any.invalid");
    //       }
    //     })
    //   ).required(),
    itinerary: Joi.string().optional(),
    cancellation_policy: Joi.string().optional(),
    tax: Joi.string().optional(),
    general_condition: Joi.string().optional(),
    installment: Joi.string().optional(),
    delete_photos: Joi.alternatives()
      .try(
        Joi.array().items(Joi.number().optional()).optional(),
        Joi.string().custom((value, helpers) => {
          try {
            const parsedDeduction = JSON.parse(value);
            return parsedDeduction;
          } catch (error) {
            return helpers.error("any.invalid");
          }
        })
      )
      .optional(),
    add_include_service: Joi.alternatives()
      .try(
        Joi.array().items(Joi.string().optional()).optional(),
        Joi.string().custom((value, helpers) => {
          try {
            const parsedDeduction = JSON.parse(value);
            return parsedDeduction;
          } catch (error) {
            return helpers.error("any.invalid");
          }
        })
      )
      .optional(),
    add_exclude_service: Joi.alternatives()
      .try(
        Joi.array().items(Joi.string().optional()).optional(),
        Joi.string().custom((value, helpers) => {
          try {
            const parsedDeduction = JSON.parse(value);
            return parsedDeduction;
          } catch (error) {
            return helpers.error("any.invalid");
          }
        })
      )
      .optional(),
    add_highlight_service: Joi.alternatives()
      .try(
        Joi.array().items(Joi.string().optional()).optional(),
        Joi.string().custom((value, helpers) => {
          try {
            const parsedDeduction = JSON.parse(value);
            return parsedDeduction;
          } catch (error) {
            return helpers.error("any.invalid");
          }
        })
      )
      .optional(),
    update_include_service: Joi.alternatives()
      .try(
        Joi.array()
          .items({
            id: Joi.number().optional(),
            title: Joi.string().optional(),
          })
          .optional(),
        Joi.string().custom((value, helpers) => {
          try {
            const parsedDeduction = JSON.parse(value);
            return parsedDeduction;
          } catch (error) {
            return helpers.error("any.invalid");
          }
        })
      )
      .optional(),
    update_exclude_service: Joi.alternatives()
      .try(
        Joi.array()
          .items({
            id: Joi.number().required(),
            title: Joi.string().required(),
          })
          .optional(),
        Joi.string().custom((value, helpers) => {
          try {
            const parsedDeduction = JSON.parse(value);
            return parsedDeduction;
          } catch (error) {
            return helpers.error("any.invalid");
          }
        })
      )
      .optional(),
    update_highlight_service: Joi.alternatives()
      .try(
        Joi.array()
          .items({
            id: Joi.number().required(),
            title: Joi.string().required(),
          })
          .optional(),
        Joi.string().custom((value, helpers) => {
          try {
            const parsedDeduction = JSON.parse(value);
            return parsedDeduction;
          } catch (error) {
            return helpers.error("any.invalid");
          }
        })
      )
      .optional(),
    delete_include_service: Joi.alternatives()
      .try(
        Joi.array().items(Joi.number().optional()).optional(),
        Joi.string().custom((value, helpers) => {
          try {
            const parsedDeduction = JSON.parse(value);
            return parsedDeduction;
          } catch (error) {
            return helpers.error("any.invalid");
          }
        })
      )
      .optional(),
    delete_exclude_service: Joi.alternatives()
      .try(
        Joi.array().items(Joi.number().optional()).optional(),
        Joi.string().custom((value, helpers) => {
          try {
            const parsedDeduction = JSON.parse(value);
            return parsedDeduction;
          } catch (error) {
            return helpers.error("any.invalid");
          }
        })
      )
      .optional(),
    delete_highlight_service: Joi.alternatives()
      .try(
        Joi.array().items(Joi.number().optional()).optional(),
        Joi.string().custom((value, helpers) => {
          try {
            const parsedDeduction = JSON.parse(value);
            return parsedDeduction;
          } catch (error) {
            return helpers.error("any.invalid");
          }
        })
      )
      .optional(),
  });

  public createTourPackageReview = Joi.object({
    booking_id: Joi.number().optional(),
    rating: Joi.number().min(1).max(5).required(),
    details: Joi.string().optional(),
  });
}
