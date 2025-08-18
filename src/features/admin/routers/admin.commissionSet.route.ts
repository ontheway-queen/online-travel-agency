import AbstractRouter from '../../../abstract/abstract.router';
import { AdminCommissionSetController } from '../controllers/admin.commissionSet.controller';

export class AdminCommissionSetRouter extends AbstractRouter {
  private controller = new AdminCommissionSetController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {

    this.router
      .route("/btoc")
      .post(this.controller.upsertBtoCCommission)
      .get(this.controller.getBtoCCommission);

    this.router
      .route('/')
      .post(this.controller.createCommissionSet)
      .get(this.controller.getCommissionSet);

    this.router
      .route('/:id')
      .get(this.controller.getSingleCommissionSet)
      .put(this.controller.updateCommissionSet);
  }
}
