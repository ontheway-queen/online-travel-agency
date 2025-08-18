import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import PublicEmailOTPService from '../services/publicEmailOTP.service';

class PublicEmailOTPController extends AbstractController {
  private service = new PublicEmailOTPService();

  constructor() {
    super();
  }
  //send email otp
  public sendEmailOtpController = this.asyncWrapper.wrap(
    { bodySchema: this.commonValidator.sendOtpInputValidator },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.sendOtpToEmailService(
        req
      );
      res.status(code).json(rest);
    }
  );

  // match email otp
  public matchEmailOtpController = this.asyncWrapper.wrap(
    { bodySchema: this.commonValidator.matchEmailOtpInputValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.matchEmailOtpService(
        req
      );

      res.status(code).json(data);
    }
  );

 
}

export default PublicEmailOTPController;
