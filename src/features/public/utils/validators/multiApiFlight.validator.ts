import Joi from "joi";
import { commonFakeNames } from "../../../../utils/miscellaneous/constants";

export default class MultiAPIFlightValidator {
  // dependent schema start ==============================================================================

  // Cabin Pref Schema
  private cabinPrefSchema = Joi.object({
    Cabin: Joi.string().valid("1", "2", "3", "4").required(),
    PreferLevel: Joi.string().required(),
  });

  // Location schema
  private locationSchema = Joi.object({
    LocationCode: Joi.string().required().uppercase().messages({
      "any.required": "Provide valid location",
    }),
  });

  /// TPA Schema
  private tpaSchema = Joi.object({
    CabinPref: this.cabinPrefSchema.required().messages({
      "any.required": "CabinPref is required",
    }),
  });

  // Origin Destination Schema
  private originDestSchema = Joi.object({
    RPH: Joi.string()
      .valid("1", "2", "3", "4", "5", "6", "7", "8", "9")
      .required()
      .messages({
        "any.required": "Provide valid RPH",
      }),
    DepartureDateTime: Joi.string()
      .pattern(new RegExp(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/))
      .required()
      .messages({
        "any.required": "Provide valid Departure date time",
        "string.pattern.base": "Invalid departure timestamp",
        "any.custom": "Invalid departure timestamp",
      })
      .custom((value, helpers) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const oneYearFromToday = new Date();
        oneYearFromToday.setFullYear(today.getFullYear() + 1);

        const departureDate = new Date(value);
        if (departureDate < today) {
          return helpers.error("any.custom");
        }
        if (departureDate > oneYearFromToday) {
          return helpers.error("any.custom");
        }
        return value;
      }),
    OriginLocation: this.locationSchema.required().messages({
      "any.required": "Provide valid origin location",
    }),
    DestinationLocation: this.locationSchema.required().messages({
      "any.required": "Provide valid destination location",
    }),
    TPA_Extensions: this.tpaSchema.required().messages({
      "any.required": "TPA Extensions is required",
    }),
  });

  // Passenger Type Schema
  private passengerTypeSchema = Joi.object({
    Code: Joi.string().length(3).required().messages({
      "any.required": "Provide valid passenger",
    }),
    Quantity: Joi.number().integer().required().messages({
      "any.required": "Provide valid quantity",
      "number.integer": "Quantity must be an integer",
    }),
  });
  // dependent schema end ==============================================================================

  // Flight search validator end
  public flightSearchSchema = Joi.object({
    JourneyType: Joi.string().valid("1", "2", "3").required(),
    airline_code: Joi.array().items({ Code: Joi.string().required() }),
    OriginDestinationInformation: Joi.array()
      .items(this.originDestSchema.required())
      .required()
      .messages({
        "any.required": "Provide valid Origin destination data",
      }),
    PassengerTypeQuantity: Joi.array()
      .items(this.passengerTypeSchema.required())
      .required()
      .messages({
        "any.required": "Provide valid passenger code and quantity data",
      }),
  });

  public flightSearchSSESchema = Joi.object({
    JourneyType: Joi.string().valid("1", "2", "3").required(),
    OriginDestinationInformation: Joi.alternatives()
      .try(
        Joi.array().items(this.originDestSchema.required()).required(),
        Joi.string().custom((value, helpers) => {
          try {
            const parsedValue = JSON.parse(value);
            const validationResult = Joi.array()
              .items(this.originDestSchema.required())
              .validate(parsedValue);
            if (validationResult.error) {
              return helpers.error("any.invalid");
            }
            return parsedValue;
          } catch (error) {
            console.error("Error parsing OriginDestinationInformation:", error);
            return helpers.error("any.invalid");
          }
        })
      )
      .required()
      .messages({
        "any.required": "Provide valid Origin destination data",
        "any.invalid": "Invalid format for Origin destination data",
      }),
    PassengerTypeQuantity: Joi.alternatives()
      .try(
        Joi.array().items(this.passengerTypeSchema.required()).required(),
        Joi.string().custom((value, helpers) => {
          try {
            const parsedValue = JSON.parse(value);
            const validationResult = Joi.array()
              .items(this.passengerTypeSchema.required())
              .validate(parsedValue);
            if (validationResult.error) {
              return helpers.error("any.invalid");
            }
            return parsedValue;
          } catch (error) {
            console.error("Error parsing PassengerTypeQuantity:", error);
            return helpers.error("any.invalid");
          }
        })
      )
      .required()
      .messages({
        "any.required": "Provide valid passenger code and quantity data",
        "any.invalid": "Invalid format for passenger code and quantity data",
      }),
    token: Joi.string().optional(),
    airline_code: Joi.alternatives().try(
      Joi.array().optional(),
      Joi.string().custom((value, helpers) => {
        try {
          const parsedValue = JSON.parse(value);
          const validationResult = Joi.array().validate(parsedValue);
          if (validationResult.error) {
            return helpers.error("any.invalid");
          }
          return parsedValue;
        } catch (error) {
          return helpers.error("any.invalid");
        }
      })
    ),
    promotion_code: Joi.string().optional(),
  });

  // Flight filter schema
  public flightFilterSchema = Joi.object({
    carrier_operating: Joi.string().optional(),
    min_price: Joi.number().optional(),
    max_price: Joi.number().optional(),
    page: Joi.number().optional(),
    search_id: Joi.string().required(),
    size: Joi.number().optional(),
    refundable: Joi.string().optional(),
    stoppage: Joi.string().optional(),
    aircraft: Joi.string().optional(),
    elapsed_time_min: Joi.string().optional(),
    departure_timing: Joi.string().optional(),
    arrival_timing: Joi.string().optional(),
    sort_by: Joi.string().optional(),
    baggage: Joi.string().optional(),
    min_departure_time: Joi.string().optional(),
    max_departure_time: Joi.string().optional(),
    min_arrival_time: Joi.string().optional(),
    max_arrival_time: Joi.string().optional(),
  });

  //FLIGHT SCHEMA FOR REVALIDATE
  public flightInfoSchema = Joi.object({
    departure_time: Joi.string().required(),
    departure_date: Joi.string().required(),
    arrival_time: Joi.string().required(),
    arrival_date: Joi.string().required(),
    carrier_marketing_flight_number: Joi.number().required(),
    departure_airport_code: Joi.string().required(),
    arrival_airport_code: Joi.string().required(),
    carrier_marketing_code: Joi.string().required(),
    carrier_operating_code: Joi.string().required(),
  });
  //ORIGIN DESTINATION INFORMATION SCHEMA FOR REVALIDATE
  public originDestinationInfoSchema = Joi.object({
    RPH: Joi.string().required(),
    DepartureDateTime: Joi.string()
      .pattern(new RegExp(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/))
      .required(),
    OriginLocation: this.locationSchema.required(),
    DestinationLocation: this.locationSchema.required(),
    flight: Joi.array().items(this.flightInfoSchema.required()).required(),
    TPA_Extensions: this.tpaSchema.optional().messages({
      "any.required": "TPA Extensions is required",
    }),
  });

  //FLIGHT REVALIDATE SCHEMA V2
  public flightRevalidateSchemaV2 = Joi.object({
    OriginDestinationInformation: Joi.array()
      .items(this.originDestinationInfoSchema.required())
      .required(),
    PassengerTypeQuantity: Joi.array()
      .items(this.passengerTypeSchema.required())
      .required(),
  });

  //FLIGHT REVALIDATE SCHEMA
  public flightRevalidateSchema = Joi.object({
    search_id: Joi.string().required(),
    flight_id: Joi.string().required(),
  });

  //FARE RULES SCHEMA
  public fareRulesSchema = Joi.object({
    search_id: Joi.string().required(),
    flight_id: Joi.string().required(),
  });

  //FLIGHT BOOKING PASSENGERS SCHEMA
  public flightBookingPassengersSchema = Joi.object({
    reference: Joi.string()
      .required()
      .valid("Mr", "Mrs", "Ms", "Master", "Miss", "MSTR"),
    first_name: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-Z\s\-']+$/) // Allows letters, spaces, hyphens, apostrophes
      .pattern(/^(?!.*(.)\1{3})/), // Blocks >3 repeating chars
    last_name: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-Z\s\-']+$/) // Allows letters, spaces, hyphens, apostrophes
      .pattern(/^(?!.*(.)\1{3})/), // Blocks >3 repeating chars
    type: Joi.string()
      .required()
      .valid(
        "ADT",
        "C02",
        "C03",
        "C04",
        "C05",
        "C06",
        "C07",
        "C08",
        "C09",
        "C10",
        "C11",
        "INF"
      ),
    date_of_birth: Joi.string()
      .optional()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .messages({
        "string.pattern.base": "date_of_birth must be in the format yyyy-mm-dd",
        "any.custom": "date_of_birth cannot be in the future",
      })
      .custom((value, helpers) => {
        const today = new Date();
        const inputDate = new Date(value);
        if (inputDate > today) {
          return helpers.error("any.custom");
        }
        return value;
      }),
    gender: Joi.string().optional().valid("Male", "Female"),
    issuing_country: Joi.number().optional(),
    nationality: Joi.number().optional(),
    passport_number: Joi.string().optional(),
    passport_expiry_date: Joi.string()
      .optional()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .messages({
        "string.pattern.base":
          "passport_expiry_date must be in the format yyyy-mm-dd",
        "any.custom":
          "passport_expiry_date must be at least 6 months from the current date",
      })
      .custom((value, helpers) => {
        const today = new Date();
        const sixMonthsFromToday = new Date();
        sixMonthsFromToday.setMonth(today.getMonth() + 6);
        const expiryDate = new Date(value);
        if (expiryDate < sixMonthsFromToday) {
          return helpers.error("any.custom");
        }
        return value;
      }),
    contact_number: Joi.string().optional(),
    contact_email: Joi.string().email().trim().lowercase().optional(),
    frequent_flyer_airline: Joi.string().optional(),
    frequent_flyer_number: Joi.string().optional(),
    passport_file: Joi.string().optional(),
    passport_issuing_date: Joi.date().optional(),
    visa_file: Joi.string().optional(),
    save_information: Joi.boolean().optional(),
  })
    .custom((obj, helpers) => {
      // Check combined first + last name
      const fullName = `${obj.first_name.toLowerCase()} ${obj.last_name.toLowerCase()}`;

      if (commonFakeNames.includes(fullName)) {
        return helpers.error("any.fakeName", {
          fullName: `${obj.first_name} ${obj.last_name}`,
        });
      }

      // Also check individual parts if needed
      if (commonFakeNames.includes(obj.first_name.toLowerCase())) {
        return helpers.error("string.fakeName", { name: obj.first_name });
      }

      if (commonFakeNames.includes(obj.last_name.toLowerCase())) {
        return helpers.error("string.fakeName", { name: obj.last_name });
      }

      return obj;
    })
    .messages({
      "any.fakeName": 'The name "{{#fullName}}" appears fake or generic',
      "string.fakeName": 'The name "{{#name}}" appears fake or generic',
    });

  public flightBookingSSRSchema = Joi.object({
    passenger_key: Joi.number().required(),
    segment_id: Joi.number().required(),
    code: Joi.string().required(),
    type: Joi.string().valid("meal", "baggage").required(),
    price: Joi.number().required(),
    desc: Joi.string().required()
  })

  //FLIGHT BOOKING SCHEMA
  public flightBookingSchema = Joi.object({
    search_id: Joi.string().required(),
    flight_id: Joi.string().required(),
    passengers: Joi.array()
      .items(this.flightBookingPassengersSchema.required())
      .required(),
  });

  //FLIGHT BOOKING SCHEMA V2 (with passport and visa file)
  public flightBooking = Joi.object({
    search_id: Joi.string().required(),
    flight_id: Joi.string().required(),
    passengers: Joi.string()
      .required()
      .custom((value, helpers) => {
        try {
          const parsedValue = JSON.parse(value);

          if (!Array.isArray(parsedValue)) {
            return helpers.error("passengers.invalidArray");
          }

          for (const passenger of parsedValue) {
            const { error } = this.flightBookingPassengersSchema
              .keys({
                key: Joi.number().required(),
              })
              .validate(passenger);

            if (error) {
              return helpers.error("passengers.invalidPassenger", {
                message: error.details[0].message,
              });
            }
          }

          return parsedValue;
        } catch (error) {
          console.error("Error parsing passengers field:", error);
          return helpers.error("passengers.invalidJSON");
        }
      }, "Validate Passengers JSON")
      .messages({
        "passengers.invalidArray": "Passengers field must be a valid array.",
        "passengers.invalidPassenger": "{{#message}}",
        "passengers.invalidJSON": "Passengers field must contain valid JSON.",
      }),
    ssr: Joi.string()
      .optional()
      .custom((value, helpers) => {
        try {
          const parsedValue = JSON.parse(value);

          if (!Array.isArray(parsedValue)) {
            return helpers.error("ssr.invalidArray");
          }

          for (const ssr of parsedValue) {
            const { error } = this.flightBookingSSRSchema
              .validate(ssr);

            if (error) {
              return helpers.error("ssr.invalidSSR", {
                message: error.details[0].message,
              });
            }
          }

          return parsedValue;
        } catch (error) {
          console.error("Error parsing ssr field:", error);
          return helpers.error("ssr.invalidJSON");
        }
      }, "Validate ssr JSON")
      .messages({
        "ssr.invalidArray": "ssr field must be a valid array.",
        "ssr.invalidPassenger": "{{#message}}",
        "ssr.invalidJSON": "ssr field must contain valid JSON.",
      }),
  });

  //ticket issue schema
  public ticketIssueSchema = Joi.object({
    payment_type: Joi.string().valid("partial", "full").required(),
  });
}
