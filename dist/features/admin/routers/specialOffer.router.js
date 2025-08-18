"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpecialOfferRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const specialOffer_controller_1 = __importDefault(require("../controllers/specialOffer.controller"));
class SpecialOfferRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new specialOffer_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        // get, create special offer
        this.router
            .route("/")
            .post(this.uploader.cloudUploadRaw(this.fileFolders.SPECIAL_OFFER), this.controller.createSpecialOffer)
            .get(this.controller.getSpecialOffers);
        // get delete, update single special offer
        this.router
            .route("/:id")
            .get(this.controller.getSingleSpecialOffer)
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.SPECIAL_OFFER), this.controller.updateSpecialOffer)
            .delete(this.controller.deleteSingleSpecialOffer);
    }
}
exports.SpecialOfferRouter = SpecialOfferRouter;
