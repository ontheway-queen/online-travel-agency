"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const tourpackageBTOC_controller_1 = require("../controllers/tourpackageBTOC.controller");
class tourPackageBTOCRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new tourpackageBTOC_controller_1.tourPackageBTOController();
        this.callRouter();
    }
    callRouter() {
        //get city name
        this.router.route('/city-name').get(this.controller.getCityName);
        //get btoc all tour package
        this.router.route('/').get(this.controller.tourPackageList);
        //get country name
        this.router.route('/country-name').get(this.controller.getCountryName);
        //get single tour package btoc
        this.router.route('/:id').get(this.controller.singleTourPackage);
    }
}
exports.default = tourPackageBTOCRouter;
