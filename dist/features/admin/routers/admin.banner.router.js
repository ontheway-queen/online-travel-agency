"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminBannerRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const admin_banner_controller_1 = require("../controllers/admin.banner.controller");
class AdminBannerRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.bannerController = new admin_banner_controller_1.AdminBannerController();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/")
            .post(this.uploader.cloudUploadRaw(this.fileFolders.COMMON_FILES), this.bannerController.uploadBanner)
            .get(this.bannerController.getBannerImage);
        this.router.route("/:id").patch(this.bannerController.updateImageStatus);
    }
}
exports.AdminBannerRouter = AdminBannerRouter;
