import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import B2bRegistrationRequestService from "../services/b2bRegistrationRequest.service";
import B2bRegistrationRequestValidator from "../utils/validators/B2bRegistrationRequest.validator";

export class B2bRegistrationRequestController extends AbstractController {
  private service = new B2bRegistrationRequestService();
  private validator = new B2bRegistrationRequestValidator();

  // Create B2B registration request
  public createB2bRegistrationRequest = this.asyncWrapper.wrap(
    { bodySchema: this.validator.registrationRequestValidator },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.createRegistrationRequest(
        req
      );
      res.status(code).json(rest);
    }
  );

  // Create B2B registration request
  public verifyRegistrationRequest = this.asyncWrapper.wrap(
    { bodySchema: this.validator.verifyRegistrationRequestValidator },
    async (req: Request, res: Response) => {
      const { otp, email, payload } = req.body
      const { code, ...rest } = await this.service.verifyRegistrationRequest(
        email, otp, payload
      );
      res.status(code).json(rest);
    }
  );
}
