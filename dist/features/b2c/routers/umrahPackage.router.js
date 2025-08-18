"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.B2CUmrahPackageRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const umrahPackage_controller_1 = require("../controllers/umrahPackage.controller");
class B2CUmrahPackageRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new umrahPackage_controller_1.B2CUmrahPackageController();
        this.callRouter();
    }
    callRouter() {
        this.router.route('/city-name').get(this.controller.getCityName);
        this.router.route('/search').get(this.controller.getAllUmrahPackageForB2C);
        this.router
            .route('/:slug')
            .get(this.controller.getSingleUmrahPackageForB2C);
    }
}
exports.B2CUmrahPackageRouter = B2CUmrahPackageRouter;
