import { Router } from 'express';
import PublicEmailOTPRouter from './routers/publicEmailOTP.router';
import PublicCommonRouter from './routers/publicCommon.router';
import PublicAIRouter from './routers/publicAI.router';

export default class PublicRootRouter {
  public Router = Router();

  // Router classes
  private publicCommonRouter = new PublicCommonRouter();
  private publicEmailOtpRouter = new PublicEmailOTPRouter();
  private publicAIRouter =  new PublicAIRouter();
  constructor() {
    this.callRouter();
  }

  private callRouter() {
    // Public common Routes
    this.Router.use('/common', this.publicCommonRouter.router);

    // Public email otp Routes
    this.Router.use('/email-otp', this.publicEmailOtpRouter.router);

    //Public AI Routes
    this.Router.use('/AI', this.publicAIRouter.router);
  }
}
