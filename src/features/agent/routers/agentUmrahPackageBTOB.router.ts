import AbstractRouter from '../../../abstract/abstract.router';
import { UmrahPackageBTOBController } from '../controllers/agentUmrahPackage.controller';


export default class UmrahPackageBTOBRouter extends AbstractRouter {
  private controller = new UmrahPackageBTOBController();
  constructor() {
    super();
    this.callRouter();
  }
  private callRouter() {
    //get all tour package
    this.router.route('/').get(this.controller.umrahPackageList);

    //get single tour package
    this.router.route('/:id').get(this.controller.singleUmrahPackage);
  }
}
