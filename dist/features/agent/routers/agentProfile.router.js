"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const agentProfile_controller_1 = __importDefault(require("../controllers/agentProfile.controller"));
class BookingProfileRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.ProfileController = new agentProfile_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        //view profile, edit profile
        this.router
            .route("/")
            .get(this.ProfileController.getProfile)
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_USER), this.ProfileController.editProfile);
        //change password
        this.router
            .route("/change-password")
            .post(this.ProfileController.changePassword);
        //get KAM
        this.router.route('/get-kam')
            .get(this.ProfileController.getKeyAreaManager);
    }
}
exports.default = BookingProfileRouter;
