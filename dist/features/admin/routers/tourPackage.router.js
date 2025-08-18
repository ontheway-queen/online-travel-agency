"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TourPackageRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const tourPackage_controller_1 = require("../controllers/tourPackage.controller");
class TourPackageRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new tourPackage_controller_1.TourPackageController();
        this.callRouter();
    }
    // call router
    callRouter() {
        // create and get all tour package
        this.router
            .route("/")
            .post(this.uploader.cloudUploadRaw(this.fileFolders.TOUR_PACKAGE), this.controller.createTourPackage)
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
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.TOUR_PACKAGE), this.controller.updateTourPackage);
    }
}
exports.TourPackageRouter = TourPackageRouter;
