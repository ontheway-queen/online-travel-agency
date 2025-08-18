"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const agentUmrahPackage_controller_1 = require("../controllers/agentUmrahPackage.controller");
class UmrahPackageBTOBRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new agentUmrahPackage_controller_1.UmrahPackageBTOBController();
        this.callRouter();
    }
    callRouter() {
        //get all tour package
        this.router.route('/').get(this.controller.umrahPackageList);
        //get single tour package
        this.router.route('/:id').get(this.controller.singleUmrahPackage);
    }
}
exports.default = UmrahPackageBTOBRouter;
