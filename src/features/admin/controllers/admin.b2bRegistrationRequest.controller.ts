import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import { AdminBtoBRegistrationRequestService } from "../services/admin.b2bRegistrationRequest.service";
import AdminB2bRegistrationRequestValidator from "../utils/validators/admin.b2bRegistrationRequest.validator";

export class AdminBtoBRegistrationRequestController extends AbstractController {
  private services = new AdminBtoBRegistrationRequestService();
  private validators = new AdminB2bRegistrationRequestValidator();
  constructor() {
    super();
  }
  // get all request
  public getAllRegistrationRequest = this.asyncWrapper.wrap(
    { querySchema: this.validators.registrationRequestQueryValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.services.getAllRegistrationRequest(
        req
      );
      res.status(code).json(data);
    }
  );

  // single request
  public getSingleRegistrationRequest = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.services.getSingleRegistrationRequest(req);
      res.status(code).json(data);
    }
  );

  // update request
  public updateRegistrationRequest = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
      bodySchema: this.validators.updateRegistrationRequestValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.services.updateSingleRegistrationRequest(req);
      res.status(code).json(data);
    }
  );
}
