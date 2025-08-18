"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CorporatePackageRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const admin_corporatePackage_controller_1 = require("../controllers/admin.corporatePackage.controller");
class CorporatePackageRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.Controller = new admin_corporatePackage_controller_1.CorporatePackageController();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route('/')
            .post(this.uploader.cloudUploadRaw(this.fileFolders.ADMIN_FILES), this.Controller.insertCorporatePackagePageInfoController)
            .get(this.Controller.getDataForCorporatePackagePage);
        this.router
            .route('/update')
            .patch(this.Controller.updateCorporateTravelPageData);
    }
}
exports.CorporatePackageRouter = CorporatePackageRouter;
