import Joi from 'joi';

export class AdminReportValidator {
  public B2CPaymentTransactionReportQueryValidator = Joi.object({
    start_date: Joi.string().isoDate().label('Start Date').optional().messages({
      'string.base': `"Start Date" must be a string`,
      'string.isoDate': `"Start Date" must be a valid ISO date (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)`,
      'any.required': `"Start Date" is required`,
    }),

    end_date: Joi.string().isoDate().label('End Date').optional().messages({
      'string.base': `"End Date" must be a string`,
      'string.isoDate': `"End Date" must be a valid ISO date`,
      'any.required': `"End Date" is required`,
    }),

    filter: Joi.string().optional().label('Filter').messages({
      'string.base': `"Filter" must be a string`,
    }),

    limit: Joi.number().integer().min(1).max(1000).optional().label('Limit').messages({
      'number.base': `"Limit" must be a number`,
      'number.min': `"Limit" must be at least 1`,
      'number.max': `"Limit" must not exceed 1000`,
    }),

    skip: Joi.number().integer().min(0).optional().label('Skip').messages({
      'number.base': `"Skip" must be a number`,
      'number.min': `"Skip" cannot be negative`,
    }),
  });

  public B2BTopUpReportQueryValidator = Joi.object({
    start_date: Joi.string().isoDate().label('Start Date').optional().messages({
      'string.base': `"Start Date" must be a string`,
      'string.isoDate': `"Start Date" must be a valid ISO date (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)`,
      'any.required': `"Start Date" is required`,
    }),

    end_date: Joi.string().isoDate().label('End Date').optional().messages({
      'string.base': `"End Date" must be a string`,
      'string.isoDate': `"End Date" must be a valid ISO date`,
      'any.required': `"End Date" is required`,
    }),

    agency_id: Joi.string().trim().optional().label('Agency ID').messages({
      'string.base': `"Agency ID" must be a string`,
    }),

    limit: Joi.number().integer().min(1).max(1000).optional().label('Limit').messages({
      'number.base': `"Limit" must be a number`,
      'number.min': `"Limit" must be at least 1`,
      'number.max': `"Limit" must not exceed 1000`,
    }),

    skip: Joi.number().integer().min(0).optional().label('Skip').messages({
      'number.base': `"Skip" must be a number`,
      'number.min': `"Skip" cannot be negative`,
    }),
  });

  public B2BLedgerReportQueryValidator = Joi.object({
    agency_id: Joi.string().trim().required().label('Agency ID').messages({
      'string.base': `"Agency ID" must be a string`,
    }),

    start_date: Joi.string().isoDate().label('Start Date').optional().messages({
      'string.base': `"Start Date" must be a string`,
      'string.isoDate': `"Start Date" must be a valid ISO date (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)`,
      'any.required': `"Start Date" is required`,
    }),

    end_date: Joi.string().isoDate().label('End Date').optional().messages({
      'string.base': `"End Date" must be a string`,
      'string.isoDate': `"End Date" must be a valid ISO date`,
      'any.required': `"End Date" is required`,
    }),

    limit: Joi.number().integer().min(1).max(1000).optional().label('Limit').messages({
      'number.base': `"Limit" must be a number`,
      'number.min': `"Limit" must be at least 1`,
      'number.max': `"Limit" must not exceed 1000`,
    }),

    skip: Joi.number().integer().min(0).optional().label('Skip').messages({
      'number.base': `"Skip" must be a number`,
      'number.min': `"Skip" cannot be negative`,
    }),
  });

  public B2BSalesReportQueryValidator = Joi.object({
    start_date: Joi.string().isoDate().label('Start Date').optional().messages({
      'string.base': `"Start Date" must be a string`,
      'string.isoDate': `"Start Date" must be a valid ISO date (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)`,
      'any.required': `"Start Date" is required`,
    }),

    end_date: Joi.string().isoDate().label('End Date').optional().messages({
      'string.base': `"End Date" must be a string`,
      'string.isoDate': `"End Date" must be a valid ISO date`,
      'any.required': `"End Date" is required`,
    }),

    limit: Joi.number().integer().min(1).max(1000).optional().label('Limit').messages({
      'number.base': `"Limit" must be a number`,
      'number.min': `"Limit" must be at least 1`,
      'number.max': `"Limit" must not exceed 1000`,
    }),

    skip: Joi.number().integer().min(0).optional().label('Skip').messages({
      'number.base': `"Skip" must be a number`,
      'number.min': `"Skip" cannot be negative`,
    }),

    agency_id: Joi.string().trim().optional().label('Agency ID').messages({
      'string.base': `"Agency ID" must be a string`,
    }),

    status: Joi.string().trim().optional().label('Status').messages({
      'string.base': `"Status" must be a string`,
    }),
  });

  public B2BTicketWiseReportQueryValidator = Joi.object({
    start_date: Joi.string().isoDate().label('Start Date').optional().messages({
      'string.base': `"Start Date" must be a string`,
      'string.isoDate': `"Start Date" must be a valid ISO date (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)`,
      'any.required': `"Start Date" is required`,
    }),

    end_date: Joi.string().isoDate().label('End Date').optional().messages({
      'string.base': `"End Date" must be a string`,
      'string.isoDate': `"End Date" must be a valid ISO date`,
      'any.required': `"End Date" is required`,
    }),

    limit: Joi.number().integer().min(1).max(1000).optional().label('Limit').messages({
      'number.base': `"Limit" must be a number`,
      'number.min': `"Limit" must be at least 1`,
      'number.max': `"Limit" must not exceed 1000`,
    }),

    skip: Joi.number().integer().min(0).optional().label('Skip').messages({
      'number.base': `"Skip" must be a number`,
      'number.min': `"Skip" cannot be negative`,
    }),

    agency_id: Joi.string().trim().optional().label('Agency ID').messages({
      'string.base': `"Agency ID" must be a string`,
    }),

    filter: Joi.string().trim().optional().label('Filter').messages({
      'string.base': `"Filter" must be a string`,
    }),
  });

  public B2BFlightBookingReportQueryValidator = Joi.object({
    start_date: Joi.string().isoDate().label('Start Date').optional().messages({
      'string.base': `"Start Date" must be a string`,
      'string.isoDate': `"Start Date" must be a valid ISO date (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)`,
      'any.required': `"Start Date" is required`,
    }),

    end_date: Joi.string().isoDate().label('End Date').optional().messages({
      'string.base': `"End Date" must be a string`,
      'string.isoDate': `"End Date" must be a valid ISO date`,
      'any.required': `"End Date" is required`,
    }),

    limit: Joi.number().integer().min(1).max(1000).optional().label('Limit').messages({
      'number.base': `"Limit" must be a number`,
      'number.min': `"Limit" must be at least 1`,
      'number.max': `"Limit" must not exceed 1000`,
    }),

    skip: Joi.number().integer().min(0).optional().label('Skip').messages({
      'number.base': `"Skip" must be a number`,
      'number.min': `"Skip" cannot be negative`,
    }),

    agency_id: Joi.string().trim().optional().label('Agency ID').messages({
      'string.base': `"Agency ID" must be a string`,
    }),

    filter: Joi.string().trim().optional().label('Filter').messages({
      'string.base': `"Filter" must be a string`,
    }),

    status: Joi.string().trim().optional().label('Status').messages({
      'string.base': `"Status" must be a string`,
    }),
  });

  public B2CFlightBookingReportQueryValidator = Joi.object({
    start_date: Joi.string().isoDate().label('Start Date').optional().messages({
      'string.base': `"Start Date" must be a string`,
      'string.isoDate': `"Start Date" must be a valid ISO date (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)`,
      'any.required': `"Start Date" is required`,
    }),

    end_date: Joi.string().isoDate().label('End Date').optional().messages({
      'string.base': `"End Date" must be a string`,
      'string.isoDate': `"End Date" must be a valid ISO date`,
      'any.required': `"End Date" is required`,
    }),

    limit: Joi.number().integer().min(1).max(1000).optional().label('Limit').messages({
      'number.base': `"Limit" must be a number`,
      'number.min': `"Limit" must be at least 1`,
      'number.max': `"Limit" must not exceed 1000`,
    }),

    skip: Joi.number().integer().min(0).optional().label('Skip').messages({
      'number.base': `"Skip" must be a number`,
      'number.min': `"Skip" cannot be negative`,
    }),

    user_id: Joi.string().trim().optional().label('User ID').messages({
      'string.base': `"User ID" must be a string`,
    }),

    filter: Joi.string().trim().optional().label('Filter').messages({
      'string.base': `"Filter" must be a string`,
    }),

    status: Joi.string().trim().optional().label('Status').messages({
      'string.base': `"Status" must be a string`,
    }),
  });
}
