import AbstractRouter from '../../../abstract/abstract.router';
import { AdminAPIAirlinesBlockController } from '../controllers/admin.apiAirlinesBlock.controller';

export class AdminAPIAirlinesBlockRouter extends AbstractRouter {
  private controller = new AdminAPIAirlinesBlockController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router.route('/').post(this.controller.create);

    this.router
      .route('/:id')
      .get(this.controller.get)
      .patch(this.controller.update)
      .delete(this.controller.delete);
  }
}
