import AbstractRouter from '../../../abstract/abstract.router';
import PublicEmailOTPController from '../controllers/publicEmailOTP.controller';
class PublicEmailOTPRouter extends AbstractRouter {
  private Controller = new PublicEmailOTPController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // send email otp router
    this.router.post('/send', this.Controller.sendEmailOtpController);

    //match otp email
    this.router.post(
      '/match',
      this.Controller.matchEmailOtpController
    );
  }
}

export default PublicEmailOTPRouter;
