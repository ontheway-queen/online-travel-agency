import AbstractRouter from '../../../abstract/abstract.router';
import PublicAIController from '../controllers/publicAI.controller';
import PublicEmailOTPController from '../controllers/publicEmailOTP.controller';
class PublicAIRouter extends AbstractRouter {
  private controller = new PublicAIController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {

    this.router.post('/get-passport-details',this.uploader.getFileBase64(), this.controller.getPassportDetails);
  }
}

export default PublicAIRouter;
