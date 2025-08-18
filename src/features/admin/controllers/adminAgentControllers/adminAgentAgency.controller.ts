import { Request, Response } from 'express';
import { AdminAgentAgencyService } from '../../services/adminAgentServices/adminAgentAgency.service';
import AbstractController from '../../../../abstract/abstract.controller';
import { AdminAgentAgencyValidator } from '../../utils/validators/adminAgentValidators/adminAgentAgency.validator';

export class AdminAgentAgencyController extends AbstractController {
  private services = new AdminAgentAgencyService();
  private validator = new AdminAgentAgencyValidator();
  constructor() {
    super();
  }

  // adjust balance controller
  public adjustAgencyBalance = this.asyncWrapper.wrap(
    { bodySchema: this.validator.depositToAgencySchema },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.adjustAgencyBalance(req);

      if (rest.success) {
        res.status(code).json(rest);
      } else {
        this.error(rest.message, code);
      }
    }
  );

  //get deposit request
  public getAllDepositRequestList = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.services.getAllDepositRequestList(req);
      res.status(code).json(data);
    }
  );

  //update deposit request
  public updateDepositRequest = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator,
      bodySchema: this.validator.updateDepositRequestBodySchema
     },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.services.updateDepositRequest(req);
      res.status(code).json(data);
    }
  );

  // get transaction controller
  public getAllTransaction = this.asyncWrapper.wrap(null, async (req: Request, res: Response) => {
    const { code, ...rest } = await this.services.getAllTransaction(req);
    res.status(code).json(rest);
  });

  // get transaction controller
  public getSingleAgencyTransaction = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getTransaction(req);

      if (rest.success) {
        res.status(code).json(rest);
      } else {
        this.error(rest.message, code);
      }
    }
  );

  // create controller
  public create = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createAgencySchema },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.create(req);

      if (rest.success) {
        res.status(code).json(rest);
      } else {
        this.error(rest.message, code);
      }
    }
  );

  // get controller
  public get = this.asyncWrapper.wrap(null, async (req: Request, res: Response) => {
    const { code, ...rest } = await this.services.get(req);
    res.status(code).json(rest);
  });

  // get single controller
  public getSingle = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getSingle(req);
      res.status(code).json(rest);
    }
  );

  // update controller
  public update = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
      bodySchema: this.validator.updateAgencySchema,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.update(req);

      if (rest.success) {
        res.status(code).json(rest);
      } else {
        this.error(rest.message, code);
      }
    }
  );

  // create agency user controller
  public createUser = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createAgencyUserSchema },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.createUser(req);

      if (rest.success) {
        res.status(code).json(rest);
      } else {
        this.error(rest.message, code);
      }
    }
  );

  // update agency user controller
  public updateUser = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
      bodySchema: this.validator.updateAgencyUserSchema,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.updateUser(req);

      if (rest.success) {
        res.status(code).json(rest);
      } else {
        this.error(rest.message, code);
      }
    }
  );

  public agentPortalLogin = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.agentPortalLogin(req);

      if (rest.success) {
        res.status(code).json(rest);
      } else {
        this.error(rest.message, code);
      }
    }
  );
}
