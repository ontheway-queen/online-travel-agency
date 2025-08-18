import AbstractRouter from '../../../abstract/abstract.router';
import { B2CUmrahPackageController } from '../controllers/umrahPackage.controller';

export class B2CUmrahPackageRouter extends AbstractRouter {
  private controller;

  constructor() {
    super();
    this.controller = new B2CUmrahPackageController();
    this.callRouter();
  }

  public callRouter() {
    this.router.route('/city-name').get(this.controller.getCityName);
    this.router.route('/search').get(this.controller.getAllUmrahPackageForB2C);
    this.router
      .route('/:slug')
      .get(this.controller.getSingleUmrahPackageForB2C);
  }
}
