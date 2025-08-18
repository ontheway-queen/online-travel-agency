import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import { AdminApiAirlinesCommissionService } from "../services/admin.apiAirlinesCommission.service";
import AdminAPIAirlinesCommissionValidator from "../utils/validators/admin.ApiAirlinesCommission.validator";

export class AdminAPIAirlinesCommissionController extends AbstractController {
  private services = new AdminApiAirlinesCommissionService();
  private validators = new AdminAPIAirlinesCommissionValidator();
  constructor() {
    super();
  }

  // Get all api controller
  public getAllAPI = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getAllApi(req);
      res.status(code).json(rest);
    }
  );

  // Get api airlines commission
  public getAPIAirlinesCommission = this.asyncWrapper.wrap(
    {
      querySchema: this.validators.getRoutesCommissionSchema,
      paramSchema: this.commonValidator.singleParamValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getAPIAirlinesCommission(
        req
      );
      res.status(code).json(rest);
    }
  );

  // Update api airlines commission
  public updateAPIAirlinesCommission = this.asyncWrapper.wrap(
    { bodySchema: this.validators.updateAPIAirlinesCommissionSchema },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.updateAPIAirlinesCommission(
        req
      );
      res.status(code).json(rest);
    }
  );
}
