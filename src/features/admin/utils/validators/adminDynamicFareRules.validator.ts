import Joi from 'joi';

export class AdminDynamicFareRulesValidator {
  public createSet = Joi.object({
    name: Joi.string().required(),
  });

  public updateSet = Joi.object({
    name: Joi.string().optional(),
  });

  public cloneSet = Joi.object({
    name: Joi.string().required(),
  });

  public createSupplier = Joi.object({
    set_id: Joi.number().required(),
    supplier_id: Joi.number().required(),
    commission: Joi.number().optional(),
    commission_type: Joi.string().optional().valid('PER', 'FLAT'),
    markup: Joi.number().optional(),
    markup_type: Joi.string().optional().valid('PER', 'FLAT'),
    segment_markup: Joi.number().optional(),
    segment_commission: Joi.number().optional(),
    segment_commission_type: Joi.string()
      .valid('PER', 'FLAT')
      .when('segment_commission', {
        is: Joi.string(),
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
    segment_markup_type: Joi.string()
      .valid('PER', 'FLAT')
      .when('segment_markup', {
        is: Joi.string(),
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),
    pax_markup: Joi.number().precision(2).optional(),
  });

  public getSupplier = Joi.object({
    set_id: Joi.number().required(),
  });

  public updateSupplier = Joi.object({
    commission: Joi.number().optional(),
    commission_type: Joi.string().optional().valid('PER', 'FLAT'),
    markup: Joi.number().optional(),
    markup_type: Joi.string().optional().valid('PER', 'FLAT'),
    status: Joi.boolean().optional(),
    segment_markup: Joi.number().optional(),
    segment_commission: Joi.number().optional(),
    segment_commission_type: Joi.string().valid('PER', 'FLAT').optional(),
    segment_markup_type: Joi.string().valid('PER', 'FLAT').optional(),
    pax_markup: Joi.number().precision(2).optional(),
  });

  public createSupplierAirlinesFare = Joi.object({
    body: Joi.array()
      .items(
        Joi.object({
          dynamic_fare_supplier_id: Joi.number()
            .integer()
            .required()
            .label('Dynamic Fare Supplier ID'),
          airline: Joi.string().required().label('Airline Code'),
          from_dac: Joi.boolean().optional().label('From DAC'),
          domestic: Joi.boolean().optional().label('Domestic'),
          to_dac: Joi.boolean().optional().label('To DAC'),
          soto: Joi.boolean().optional().label('SOTO'),
          pax_markup: Joi.number().precision(2).optional(),
          commission_type: Joi.string()
            .valid('PER', 'FLAT')
            .optional()
            .label('Commission Type'),
          commission: Joi.number().precision(2).optional().label('Commission'),
          markup_type: Joi.string()
            .valid('PER', 'FLAT')
            .optional()
            .label('Markup Type'),
          markup: Joi.number().precision(2).optional().label('Markup'),
          flight_class: Joi.string()
            .valid('ECONOMY', 'BUSINESS', 'FIRST', 'PREMIUM')
            .optional()
            .allow(null, '')
            .label('Class'),
          segment_commission: Joi.number()
            .precision(2)
            .optional()
            .label('Segment Commission'),
          segment_commission_type: Joi.string()
            .valid('PER', 'FLAT')
            .optional()
            .label('Segment Commission Type'),
          segment_markup: Joi.number()
            .precision(2)
            .optional()
            .label('Segment Markup'),
          segment_markup_type: Joi.string()
            .valid('PER', 'FLAT')
            .optional()
            .label('Segment Markup Type'),
        })
      )
      .min(1)
      .required()
      .label('Supplier Airline Fare List'),
  });

  public getSupplierAirlinesFare = Joi.object({
    dynamic_fare_supplier_id: Joi.number().required(),
  });

  public updateSupplierAirlinesFare = Joi.object({
    from_dac: Joi.boolean().optional().label('From DAC'),
    to_dac: Joi.boolean().optional().label('To DAC'),
    soto: Joi.boolean().optional().label('SOTO'),
    domestic: Joi.boolean().optional().label('Domestic'),
    commission_type: Joi.string()
      .valid('PER', 'FLAT')
      .optional()
      .label('Commission Type'),
    commission: Joi.number().precision(2).optional().label('Commission'),
    markup_type: Joi.string()
      .valid('PER', 'FLAT')
      .optional()
      .label('Markup Type'),
    markup: Joi.number().precision(2).optional().label('Markup'),
    flight_class: Joi.string().optional().label('Class'),
    status: Joi.boolean().optional().label('Status'),
    segment_commission: Joi.number()
      .precision(2)
      .optional()
      .label('Segment Commission'),
    pax_markup: Joi.number()
      .precision(2)
      .optional()
      .label('Segment Commission'),
    segment_commission_type: Joi.string()
      .valid('PER', 'FLAT')
      .optional()
      .label('Segment Commission Type'),
    segment_markup: Joi.number()
      .precision(2)
      .optional()
      .label('Segment Markup'),
    segment_markup_type: Joi.string()
      .valid('PER', 'FLAT')
      .optional()
      .label('Segment Markup Type'),
  }).min(1);

  public createFareTax = Joi.object({
    body: Joi.array()
      .items(
        Joi.object({
          dynamic_fare_supplier_id: Joi.number()
            .integer()
            .required()
            .label('Dynamic Fare Supplier ID'),
          airline: Joi.string().required().label('Airline Code'),
          tax_name: Joi.string().required().label('Tax Name'),
          commission: Joi.number().precision(2).optional().label('Commission'),
          commission_type: Joi.string()
            .valid('PER', 'FLAT')
            .optional()
            .label('Commission Type'),
          markup: Joi.number().precision(2).optional().label('Markup'),
          markup_type: Joi.string()
            .valid('PER', 'FLAT')
            .optional()
            .label('Markup Type'),
          from_dac: Joi.boolean().required().label('From DAC'),
          to_dac: Joi.boolean().required().label('To DAC'),
          soto: Joi.boolean().required().label('SOTO'),
          domestic: Joi.boolean().required().label('Domestic')
        })
      )
      .min(1)
      .required()
      .label('Fare Tax Items'),
  });

  public getFareTax = Joi.object({
    dynamic_fare_supplier_id: Joi.number().required(),
  });

  public updateFareTax = Joi.object({
    dynamic_fare_supplier_id: Joi.number()
      .integer()
      .optional()
      .label('Dynamic Fare Supplier ID'),
    airline: Joi.string().optional().label('Airline Code'),
    tax_name: Joi.string().optional().label('Tax Name'),
    commission: Joi.number().precision(2).optional().label('Commission'),
    commission_type: Joi.string()
      .valid('PER', 'FLAT')
      .optional()
      .label('Commission Type'),
    markup: Joi.number().precision(2).optional().label('Markup'),
    markup_type: Joi.string()
      .valid('PER', 'FLAT')
      .optional()
      .label('Markup Type'),
    status: Joi.boolean().optional().label('Status'),
    from_dac: Joi.boolean().optional().label('From DAC'),
    to_dac: Joi.boolean().optional().label('To DAC'),
    soto: Joi.boolean().optional().label('SOTO'),
    domestic: Joi.boolean().optional().label('Domestic')
  }).min(1);

  public upsertBtoCSetSchema = Joi.object({
    commission_set_id: Joi.number().required(),
  });
}
