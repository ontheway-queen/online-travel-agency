import AbstractRouter from "../../../abstract/abstract.router";
import SpecialOfferController from "../controllers/specialOffer.controller";

export class SpecialOfferRouter extends AbstractRouter {
  private controller = new SpecialOfferController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // get, create special offer
    this.router
      .route("/")
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.SPECIAL_OFFER),
        this.controller.createSpecialOffer
      )
      .get(this.controller.getSpecialOffers);

    // get delete, update single special offer
    this.router
      .route("/:id")
      .get(this.controller.getSingleSpecialOffer)
      .patch(
        this.uploader.cloudUploadRaw(this.fileFolders.SPECIAL_OFFER),
        this.controller.updateSpecialOffer
      )
      .delete(this.controller.deleteSingleSpecialOffer);
  }
}
