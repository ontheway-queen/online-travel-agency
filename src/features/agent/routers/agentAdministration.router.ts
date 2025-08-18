import AbstractRouter from "../../../abstract/abstract.router";
import BtobAdministrationController from "../controllers/agentAdministration.controller";

class BtobAdministrationRouter extends AbstractRouter {
  private AdministrationController = new BtobAdministrationController();

  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
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
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_USER),
        this.AdministrationController.createAdmin
      )
      .get(this.AdministrationController.getAllAdmin);

    //get single admin, update admin
    this.router
      .route("/admin/:id")
      .get(this.AdministrationController.getSingleAdmin)
      .patch(
        this.uploader.cloudUploadRaw(this.fileFolders.AGENCY_USER),
        this.AdministrationController.updateAdmin
      );

    //get audit
    this.router.route("/audit-trail").get(this.AdministrationController.getAuditTrail);
  }
}

export default BtobAdministrationRouter;
