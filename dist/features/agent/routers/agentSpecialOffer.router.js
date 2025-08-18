"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpecialOfferBToCRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const agentSpecialOffer_controller_1 = __importDefault(require("../controllers/agentSpecialOffer.controller"));
class SpecialOfferBToCRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentSpecialOffer_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        // get special offers
        this.router.route("/").get(this.controller.getSpecialOffers);
        // get  single special offer
        this.router.route("/:id").get(this.controller.getSingleSpecialOffer);
    }
}
exports.SpecialOfferBToCRouter = SpecialOfferBToCRouter;
