import AbstractRouter from '../../../abstract/abstract.router';
import { UmrahPackageController } from '../controllers/admin.umrahpackage.controller';

export class UmrahPackageRouter extends AbstractRouter {
  private umrahPackageController;

  constructor() {
    super();
    this.umrahPackageController = new UmrahPackageController();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route('/')
      // Craete Umrah Package
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.PACKAGE_FILE),
        this.umrahPackageController.createUmrahPackage
      )
      // Get All Umrah Package
      .get(this.umrahPackageController.getAllUmrahPackage);

    //Get include exclude item
    this.router
      .route('/include-exclude')
      .get(this.umrahPackageController.getIncludeExcludeItems);

    this.router
      .route('/detail-description')
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.PACKAGE_FILE),
        this.umrahPackageController.createDetailDescription
      );

    this.router
      .route('/:id')
      // Get Single Umrah Package
      .get(this.umrahPackageController.getSingleUmrahPackage)
      // Update Single Umrah Package
      .patch(
        this.uploader.cloudUploadRaw(this.fileFolders.PACKAGE_FILE),
        this.umrahPackageController.updateUmrahPackage
      );
  }
}
