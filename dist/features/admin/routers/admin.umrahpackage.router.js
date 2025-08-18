"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UmrahPackageRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const admin_umrahpackage_controller_1 = require("../controllers/admin.umrahpackage.controller");
class UmrahPackageRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.umrahPackageController = new admin_umrahpackage_controller_1.UmrahPackageController();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route('/')
            // Craete Umrah Package
            .post(this.uploader.cloudUploadRaw(this.fileFolders.PACKAGE_FILE), this.umrahPackageController.createUmrahPackage)
            // Get All Umrah Package
            .get(this.umrahPackageController.getAllUmrahPackage);
        //Get include exclude item
        this.router
            .route('/include-exclude')
            .get(this.umrahPackageController.getIncludeExcludeItems);
        this.router
            .route('/detail-description')
            .post(this.uploader.cloudUploadRaw(this.fileFolders.PACKAGE_FILE), this.umrahPackageController.createDetailDescription);
        this.router
            .route('/:id')
            // Get Single Umrah Package
            .get(this.umrahPackageController.getSingleUmrahPackage)
            // Update Single Umrah Package
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.PACKAGE_FILE), this.umrahPackageController.updateUmrahPackage);
    }
}
exports.UmrahPackageRouter = UmrahPackageRouter;
