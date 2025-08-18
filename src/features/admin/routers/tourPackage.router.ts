import AbstractRouter from "../../../abstract/abstract.router";
import { TourPackageController } from "../controllers/tourPackage.controller";


export class TourPackageRouter extends AbstractRouter {
  private controller = new TourPackageController();
  constructor() {
    super();
    this.callRouter();
  }

  // call router
  private callRouter() {
    // create and get all tour package
    this.router
      .route("/")
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.TOUR_PACKAGE),
        this.controller.createTourPackage
      )
      .get(this.controller.getAllTourPackage);

    // get all tour package requests
    this.router.route("/request").get(this.controller.getTourPackageRequest);

    // update tour package request
    this.router
      .route("/request/:id")
      .patch(this.controller.updateTourPackageRequest);

    // get single tour package,delete single tour package,update tour package
    this.router
      .route("/:id")
      //get single tour package
      .get(this.controller.getSingleTourPackage)
      //delete single tour package
      .delete(this.controller.deleteSingleTourPackage)
      //update tour package
      .patch(
        this.uploader.cloudUploadRaw(this.fileFolders.TOUR_PACKAGE),
        this.controller.updateTourPackage
      );
  }
}
