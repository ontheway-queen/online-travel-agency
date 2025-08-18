import AbstractRouter from '../../../abstract/abstract.router';
import { AdminFlightRouteConfigController } from '../controllers/admin.flightRouteConfig.controller';

export class AdminFlightRouteConfigRouter extends AbstractRouter {
  private controller = new AdminFlightRouteConfigController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // Get create routes commission
    this.router
      .route('/set-commission/:id')
      .post(this.controller.createRoutesCommission)
      .get(this.controller.getRoutesCommission);

    // Update delete routes commission
    this.router
      .route('/set-commission/:commission_set_id/route/:id')
      .patch(this.controller.updateRoutesCommission)
      .delete(this.controller.deleteRoutesCommission);

    // Get create routes block
    this.router
      .route('/block')
      .post(this.controller.createRoutesBlock)
      .get(this.controller.getRoutesBlock);

    // Update delete routes block
    this.router
      .route('/block/:id')
      .patch(this.controller.updateRoutesBlock)
      .delete(this.controller.deleteRoutesBlock);
  }
}
