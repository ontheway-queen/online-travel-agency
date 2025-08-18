import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import { AdminCommissionSetService } from '../services/admin.commissionSet.service';
import AdminCommissionSetValidator from '../utils/validators/admin.commissionSet.validator';

export class AdminCommissionSetController extends AbstractController {
  private service = new AdminCommissionSetService();
  private validator = new AdminCommissionSetValidator();
  constructor() {
    super();
  }

  // Create Commission set
  public createCommissionSet = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createCommissionSetSchema },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createCommissionSet(req);
      res.status(code).json(data);
    }
  );

  // Get commission set
  public getCommissionSet = this.asyncWrapper.wrap(
    { querySchema: this.validator.getCommissionSetSchema },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getCommissionSet(req);
      res.status(code).json(data);
    }
  );

  // Get single commission set
  public getSingleCommissionSet = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSingleCommissionSet(req);
      res.status(code).json(data);
    }
  );

  // Update set Commission
  public updateCommissionSet = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
      bodySchema: this.validator.updateCommissionSetSchema,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.updateCommissionSet(req);
      res.status(code).json(data);
    }
  );

  // upsert btoc set Commission
  public upsertBtoCCommission = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.upsertBtoCCommissionSchema,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.upsertBtoCCommission(req);
      res.status(code).json(data);
    }
  );

  // get btoc set Commission
  public getBtoCCommission = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getBtoCCommission(req);
      res.status(code).json(data);
    }
  );
}
