"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const publicAI_controller_1 = __importDefault(require("../controllers/publicAI.controller"));
class PublicAIRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new publicAI_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        this.router.post('/get-passport-details', this.uploader.getFileBase64(), this.controller.getPassportDetails);
    }
}
exports.default = PublicAIRouter;
