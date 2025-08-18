import Joi from "joi";
// flight booking validator schema
class FlightBookingValidator {
  // get all flight booking validator
  public getAllFlightBookingSchema = Joi.object({
    status: Joi.string().allow("").optional(),
    pnr: Joi.string().allow("").optional(),
    limit: Joi.string().allow("").optional(),
    skip: Joi.string().allow("").optional(),
    from_date: Joi.string().allow("").optional(),
    to_date: Joi.string().allow("").optional(),
  });
  // pnr create schema start //
  private passengerSchema = Joi.object({
    type: Joi.string()
      .valid(
       "Adult",
       "Child",
       "Infant"
      )
      .required()
      .messages({
        "any.required": "Provide valid passenger type",
        "any.only": "Invalid passenger type",
      }),
    title: Joi.string()
      .valid("Ms", "Mr", "Mrs","Mstr","Miss")
      .required()
      .messages({
        "any.required": "Provide valid passenger title",
      }),
    first_name: Joi.string().required().messages({
      "any.required": "Provide valid f name",
    }),
    last_name: Joi.string().required().messages({
      "any.required": "Provide valid l name",
    }),
    contact_number: Joi.string().required().messages({
      "any.required": "Provide valid phone",
    }),
    date_of_birth: Joi.string().required().messages({
      "any.required": "Provide valid date of birth",
    }),
    gender: Joi.string()
      .required()
      .messages({
        "any.required": "Provide valid gender",
        "any.only": "Invalid gender",
      }),
    email: Joi.string().email().required().lowercase().trim().messages({
      "any.required": "Provide valid email",
      "string.email": "Invalid email format",
    }),
    address: Joi.string().allow('').required().messages({
      'string.empty': 'Address must be a string',
    }),
    country_code: Joi.string().required(),
    nationality: Joi.string().required(),
    passport_number: Joi.string().optional(),
    passport_expiry_date: Joi.string().optional(),
    passport_nationality: Joi.string().optional(),
    is_lead_passenger: Joi.boolean().required()
    // save_information: Joi.boolean().optional(),
  });
  public pnrCreateSchema = Joi.object({
    flight_id: Joi.string().required().messages({
      "any.required": "Provide valid flight id",
    }),
    passengers:Joi.array().items(this.passengerSchema.required()).required(),
  });
  // TICKET ISSUE SCHEMA
  public ticketIssueSchema = Joi.object({
    booking_id: Joi.number().required().messages({
      "any.required": "Provide valid booking id",
    }),
  });

  public btocBookingRequestValidator = Joi.object({
    status: Joi.string().valid("cancelled").required(),
  });
}
export default FlightBookingValidator;
