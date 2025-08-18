import AbstractRouter from "../../../abstract/abstract.router";
import SpecialOfferBToCController from "../controllers/specialOfferBToC.controller";

export class SpecialOfferBToCRouter extends AbstractRouter {
  private controller = new SpecialOfferBToCController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // get special offers
    this.router.route("/").get(this.controller.getSpecialOffers);

    // get  single special offer
    this.router.route("/:id").get(this.controller.getSingleSpecialOffer);
  }
}
