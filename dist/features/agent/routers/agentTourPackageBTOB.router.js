"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const agentTourpackage_controller_1 = require("../controllers/agentTourpackage.controller");
;
class tourPackageBTOBRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentTourpackage_controller_1.tourPackageBTOBController();
        this.callRouter();
    }
    callRouter() {
        //get all tour package
        this.router.route('/').get(this.controller.tourPackageList);
        //get single tour package
        this.router.route('/:id').get(this.controller.singleTourPackage);
    }
}
exports.default = tourPackageBTOBRouter;
