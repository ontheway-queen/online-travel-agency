"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingVisaRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const bookingVisa_controller_1 = require("../controllers/bookingVisa.controller");
class BookingVisaRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.controller = new bookingVisa_controller_1.BookingVisaController();
        this.callRouter();
    }
    callRouter() {
        //create application, list
        this.router
            .route("/")
            .post(this.uploader.cloudUploadRaw(this.fileFolders.VISA_FILES), this.controller.createApplication)
            .get(this.controller.getApplicationList);
        //single application
        this.router.route("/:id").get(this.controller.getSingleApplication);
    }
}
exports.BookingVisaRouter = BookingVisaRouter;
