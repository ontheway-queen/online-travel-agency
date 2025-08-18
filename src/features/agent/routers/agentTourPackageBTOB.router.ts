import AbstractRouter from '../../../abstract/abstract.router';
import { tourPackageBTOBController } from '../controllers/agentTourpackage.controller';
;
export default class tourPackageBTOBRouter extends AbstractRouter {
  private controller = new tourPackageBTOBController();
  constructor() {
    super();
    this.callRouter();
  }
  private callRouter() {
    //get all tour package
    this.router.route('/').get(this.controller.tourPackageList);

    //get single tour package
    this.router.route('/:id').get(this.controller.singleTourPackage);
  }

  
}
