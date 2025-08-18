import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import AdminAuthService from '../services/auth.admin.service';

class AdminAuthController extends AbstractController {
  private adminAuthService = new AdminAuthService();
  constructor() {
    super();
  }

  //admin login
  public login = this.asyncWrapper.wrap(
    { bodySchema: this.commonValidator.loginValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.adminAuthService.loginService(req);
      res.status(code).json(data);
    }
  );

  //verify otp
  public verifyOTP = this.asyncWrapper.wrap(
    { bodySchema: this.commonValidator.verifyOTPInputValidationSchema },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.adminAuthService.verifyOTP(req);
      res.status(code).json(data);
    }
  );


  public resendOTP = this.asyncWrapper.wrap(
    { bodySchema: this.commonValidator.resendOTPInputValidationSchema },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.adminAuthService.resendOTP(req);
      res.status(code).json(data);
    }
  );


  //admin forget pass
  public forgetPassword = this.asyncWrapper.wrap(
    { bodySchema: this.commonValidator.commonForgetPassInputValidation },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.adminAuthService.forgetPassword(req);
      res.status(code).json(data);
    }
  );
}

export default AdminAuthController;
