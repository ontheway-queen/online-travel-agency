import AbstractRouter from '../../../abstract/abstract.router';
import { CorporatePackageController } from '../controllers/admin.corporatePackage.controller';

export class CorporatePackageRouter extends AbstractRouter {
  private Controller;
  constructor() {
    super();
    this.Controller = new CorporatePackageController();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route('/')
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.ADMIN_FILES),
        this.Controller.insertCorporatePackagePageInfoController
      )
      .get(this.Controller.getDataForCorporatePackagePage);

    this.router
      .route('/update')
      .patch(this.Controller.updateCorporateTravelPageData);
  }
}
