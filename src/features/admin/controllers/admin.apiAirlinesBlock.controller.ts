import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import { AdminApiAirlinesCommissionService } from '../services/admin.apiAirlinesCommission.service';
import AdminAPIAirlinesCommissionValidator from '../utils/validators/admin.ApiAirlinesCommission.validator';
import AdminAPIAirlinesBlockValidator from '../utils/validators/admin.apiAirlinesBlock.validator';
import { AdminApiAirlinesBlockService } from '../services/admin.apiAirlinesBlock.service';

export class AdminAPIAirlinesBlockController extends AbstractController {
  private services = new AdminApiAirlinesBlockService();
  private validators = new AdminAPIAirlinesBlockValidator();
  constructor() {
    super();
  }

  //create
  public create = this.asyncWrapper.wrap(
    { bodySchema: this.validators.create },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.create(req);
      res.status(code).json(rest);
    }
  );

  // update
  public update = this.asyncWrapper.wrap(
    {
      bodySchema: this.validators.update,
      paramSchema: this.commonValidator.singleParamValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.update(req);
      res.status(code).json(rest);
    }
  );

  //get all
  public get = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.get(req);
      res.status(code).json(rest);
    }
  );

  // delete
  public delete = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.delete(req);
      res.status(code).json(rest);
    }
  );
}
