import Joi from "joi";

export class AdminAnnouncementValidator {
  public createAnnouncementSchema = Joi.object({
    message: Joi.string().required(),
    start_date: Joi.date().required(),
    end_date: Joi.date().optional(),
    link: Joi.string().optional().allow(""),
    is_active: Joi.boolean().optional(),
    type: Joi.string().valid("B2B", "B2C").required(),
  });

  public updateAnnouncementSchema = Joi.object({
    message: Joi.string().optional(),
    start_date: Joi.date().optional(),
    end_date: Joi.date().optional(),
    link: Joi.string().optional().allow("").allow(null),
    is_active: Joi.boolean().optional(),
    type: Joi.string().valid("B2B", "B2C").optional(),
  });
}
