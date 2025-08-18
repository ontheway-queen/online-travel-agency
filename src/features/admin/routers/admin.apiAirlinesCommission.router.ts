import AbstractRouter from '../../../abstract/abstract.router';
import { AdminAPIAirlinesCommissionController } from '../controllers/admin.apiAirlinesCommission.controller';

export class AdminAPIAirlinesCommissionRouter extends AbstractRouter {
  private controller = new AdminAPIAirlinesCommissionController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.route('/').get(this.controller.getAllAPI);

    this.router
      .route('/set/commission/:id')
      .post(this.controller.updateAPIAirlinesCommission)
      .get(this.controller.getAPIAirlinesCommission);
  }
}
