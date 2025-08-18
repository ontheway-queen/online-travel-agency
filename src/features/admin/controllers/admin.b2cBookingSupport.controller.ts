import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import { B2CBookingSupportValidator } from "../../b2c/utils/validators/B2CBookingSupportValidator";
import { AdminBtoCBookingService } from "../services/admin.b2cBookingService.service";

export class AdminBtoCBookingSupportController extends AbstractController {
  private services = new AdminBtoCBookingService();
  private validators = new B2CBookingSupportValidator();

  constructor() {
    super();
  }

  // get
  public getList = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getList(req);
      res.status(code).json(rest);
    }
  );

  // get single
  public getDetails = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getDetails(req);
      res.status(code).json(rest);
    }
  );

  // create message
  public createMessage = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
      bodySchema: this.validators.createMessageSchema,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.createMessage(req);
      res.status(code).json(rest);
    }
  );

  // close support
  public closeSupport = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
      bodySchema: this.validators.closeSchema,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.closeSupport(req);
      res.status(code).json(rest);
    }
  );
}
