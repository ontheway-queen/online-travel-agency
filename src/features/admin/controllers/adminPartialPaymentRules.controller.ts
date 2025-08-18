import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import { AdminPartialPaymentRuleService } from "../services/adminPartialPaymentRules.service";
import { AdminPartialPaymentRuleValidator } from "../utils/validators/adminPartialPaymentRules.validator";

export class AdminPartialPaymentRuleController extends AbstractController {
  private service = new AdminPartialPaymentRuleService();
  private validator = new AdminPartialPaymentRuleValidator();

  public create = this.asyncWrapper.wrap(
    { bodySchema: this.validator.create },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.create(req);
      res.status(code).json(data);
    }
  );

  public getAll = this.asyncWrapper.wrap(
    { querySchema: this.validator.get },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getAll(req);
      res.status(code).json(data);
    }
  );

  public update = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
      bodySchema: this.validator.update
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.update(req);
      res.status(code).json(data);
    }
  );

  public delete = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.delete(req);
      res.status(code).json(data);
    }
  );

  public getFlightAPIs = this.asyncWrapper.wrap(
   null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getFlightAPIs(req);
      res.status(code).json(data);
    }
  );
}
