import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import StatusCode from "../../utils/miscellaneous/statusCode";
import CustomError from "../../utils/lib/customError";
import Models from "../../models/rootModel";
import Lib from "../../utils/lib/lib";

type Func = (req: Request, res: Response, next: NextFunction) => Promise<void>;

type Validators = {
  bodySchema?: Joi.ObjectSchema<any>;
  paramSchema?: Joi.ObjectSchema<any>;
  querySchema?: Joi.ObjectSchema<any>;
};

export default class Wrapper {
  // CONTROLLER ASYNCWRAPPER
  public wrap(schema: Validators | null, cb: Func) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { params, query, body } = req;
        if (schema) {
          if (schema.bodySchema) {
            const validateBody = await schema.bodySchema.validateAsync(body);
            req.body = validateBody;
          }
          if (schema.paramSchema) {
            const validateParams = await schema.paramSchema.validateAsync(
              params
            );
            req.params = validateParams;
          }
          if (schema.querySchema) {
            const validateQuery = await schema.querySchema.validateAsync(query);
            req.query = validateQuery;
          }
        }

        await cb(req, res, next);


        // Audit logging
        if (req.method !== 'GET' && [200, 201, 202, 204].includes(res.statusCode) && (req.admin || req.agency)) {
          try {
            const message = Lib.generateAuditMessage(req);
            if (message.success) {
              if (req.admin) {
                await new Models().adminAuditTrailModel().createAudit({
                  created_by: req.admin.id,
                  details: message.message,
                  type: message.type,
                });
              } else if (req.agency) {
                await new Models().btobAuditTrailModel().createBtoBAudit({
                  created_by: req.agency.id,
                  details: message.message,
                  type: message.type,
                  agency_id: req.agency.agency_id
                });
              }
            }
          } catch (auditError) {
            console.error('Audit logging failed:', auditError);
          }
        }
      } catch (err: any) {
        console.log({ err }, "error from wrap");

        if (err.isJoi) {
          res.status(StatusCode.HTTP_UNPROCESSABLE_ENTITY).json({
            success: false,
            message: err.message,
          });
        } else {
          next(new CustomError(err.message, err.status, err.level, err.metadata));
        }
      }
    };
  }

  //ASYNC WRAPPER WHILE USING SSE
  public SSEwrap(schema: Validators | null, cb: Func) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { params, query, body } = req;
        if (schema) {
          if (schema.bodySchema) {
            const validateBody = await schema.bodySchema.validateAsync(body);
            req.body = validateBody;
          }
          if (schema.paramSchema) {
            const validateParams = await schema.paramSchema.validateAsync(
              params
            );
            req.params = validateParams;
          }
          if (schema.querySchema) {
            const validateQuery = await schema.querySchema.validateAsync(query);
            req.query = validateQuery;
          }
        }

        await cb(req, res, next);
      } catch (err: any) {

        if (err.isJoi) {
          res.write(`error: ${JSON.stringify(err.message)}\n\n`);
          res.end();
        } else {
          next(new CustomError(err.message, err.status, err.level, err.metadata));
        }
      }
    };
  }
}
