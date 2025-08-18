import AbstractRouter from '../../../abstract/abstract.router';
import { tourPackageBTOController } from '../controllers/tourpackageBTOC.controller';
export default class tourPackageBTOCRouter extends AbstractRouter {
  private controller = new tourPackageBTOController();
  constructor() {
    super();
    this.callRouter();
  }
  private callRouter() {
    //get city name
    this.router.route('/city-name').get(this.controller.getCityName);

    //get btoc all tour package
    this.router.route('/').get(this.controller.tourPackageList);

    //get country name
    this.router.route('/country-name').get(this.controller.getCountryName);

    //get single tour package btoc
    this.router.route('/:id').get(this.controller.singleTourPackage);

    
  }
}
