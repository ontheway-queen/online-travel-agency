"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const agentAdministration_controller_1 = __importDefault(require("../controllers/agentAdministration.controller"));
class BtobAdministrationRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.AdministrationController = new agentAdministration_controller_1.default();
        this.callRouter();
    }
    callRouter() {
        //create role, view role
        this.router
            .route("/role")
            .post(this.AdministrationController.createRole)
            .get(this.AdministrationController.roleList);
        //create permission, view permission
        this.router
            .route("/permission")
            .get(this.AdministrationController.permissionList)
            .post(this.AdministrationController.createPermission);
        //get role permissions, update role permissions
        this.router
            .route("/role/:id")
            .get(this.AdministrationController.getSingleRolePermission)
            .patch(this.AdministrationController.updateRolePermissions);
        //create admin, view admin
        this.router
            .route("/admin")
            .post(this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_USER), this.AdministrationController.createAdmin)
            .get(this.AdministrationController.getAllAdmin);
        //get single admin, update admin
        this.router
            .route("/admin/:id")
            .get(this.AdministrationController.getSingleAdmin)
            .patch(this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_USER), this.AdministrationController.updateAdmin);
        //get audit
        this.router.route("/audit-trail").get(this.AdministrationController.getAuditTrail);
    }
}
exports.default = BtobAdministrationRouter;
