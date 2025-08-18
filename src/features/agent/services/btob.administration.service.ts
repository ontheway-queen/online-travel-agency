import AbstractServices from "../../../abstract/abstract.service";
import { Request } from "express";
import Lib from "../../../utils/lib/lib";

class BtobAdministrationService extends AbstractServices {
  // create role
  public async createRole(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { agency_id, id } = req.agency;

      const model = this.Model.btobAdministrationModel(trx);
      const { role_name, permissions } = req.body;
      const check_name = await model.getSingleRole({
        name: role_name,
        agency_id,
      });

      if (check_name.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: `Role already exists with this name`,
        };
      }
      const role_res = await model.createRole({
        name: role_name,
        created_by: id,
        agency_id: agency_id,
      });

      const uniquePermission: any = [];

      for (let i = 0; i < permissions.length; i++) {
        let found = false;
        for (let j = 0; j < uniquePermission.length; j++) {
          if (
            permissions[i].permission_id == uniquePermission[j].permission_id
          ) {
            found = true;
            break;
          }
        }

        if (!found) {
          uniquePermission.push(permissions[i]);
        }
      }

      if (uniquePermission.length) {
        const permission_body = uniquePermission.map((element: any) => {
          return {
            role_id: role_res[0].id,
            permission_id: element.permission_id,
            read: element.read,
            write: element.write,
            update: element.update,
            delete: element.delete,
            created_by: id,
            agency_id: agency_id,
          };
        });

        await model.createRolePermission(permission_body);
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
      };
    });
  }

  //role list
  public async roleList(req: Request) {
    const { limit, skip } = req.query;

    const model = this.Model.btobAdministrationModel();
    const role_list = await model.roleList({
      limit: Number(limit),
      skip: Number(skip),
      agency_id: req.agency.agency_id,
    });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: role_list.total,
      data: role_list.data,
    };
  }

  //create permission
  public async createPermission(req: Request) {
    const { id } = req.agency;
    const model = this.Model.btobAdministrationModel();
    const check_name = await model.permissionsList({
      name: req.body.permission_name,
    });
    if (check_name.data.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_CONFLICT,
        message: this.ResMsg.PERMISSION_NAME_EXIST,
      };
    }
    const create_permission = await model.createPermission({
      name: req.body.permission_name,
      created_by: id,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      message: this.ResMsg.HTTP_SUCCESSFUL,
    };
  }

  //permission list
  public async permissionList(req: Request) {
    const { limit, skip } = req.query;
    const model = this.Model.btobAdministrationModel();
    const permission_list = await model.permissionsList({
      limit: Number(limit),
      skip: Number(skip),
    });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: permission_list.total,
      data: permission_list.data,
    };
  }

  //get single role permission
  public async getSingleRolePermission(req: Request) {
    const role_id = req.params.id;
    const model = this.Model.btobAdministrationModel();

    const role_permission = await model.getSingleRole({
      id: parseInt(role_id),
      agency_id: req.agency.agency_id,
    });

    if (!role_permission.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: role_permission[0],
    };
  }

  //update role permission
  public async updateRolePermissions(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id, agency_id } = req.agency;
      const model = this.Model.btobAdministrationModel(trx);
      const { id: role_id } = req.params;

      const check_role = await model.getSingleRole({
        id: Number(role_id),
        agency_id,
      });

      if (!check_role.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const { add_permissions, role_name, status } = req.body;

      // console.log({ add_permissions, role_name, status });

      if (role_name || status) {
        await model.updateRole({ name: role_name, status }, Number(role_id));
      }

      if (add_permissions.length) {
        const { data: getAllPermission } = await model.permissionsList({});

        const add_permissionsValidataion: any = [];

        for (let i = 0; i < add_permissions.length; i++) {
          for (let j = 0; j < getAllPermission?.length; j++) {
            if (
              add_permissions[i].permission_id ==
              getAllPermission[j].permission_id
            ) {
              add_permissionsValidataion.push(add_permissions[i]);
            }
          }
        }

        // get single role permission
        const { permissions } = check_role[0];

        const insertPermissionVal: any = [];
        const haveToUpdateVal: any = [];

        for (let i = 0; i < add_permissionsValidataion.length; i++) {
          let found = false;

          for (let j = 0; j < permissions.length; j++) {
            if (
              add_permissionsValidataion[i].permission_id ==
              permissions[j].permission_id
            ) {
              found = true;
              haveToUpdateVal.push(add_permissionsValidataion[i]);
              break;
            }
          }

          if (!found) {
            insertPermissionVal.push(add_permissions[i]);
          }
        }

        // console.log("haveToUpdateVal", haveToUpdateVal);

        // console.log(haveToUpdateVal);

        // insert permission
        const add_permission_body = insertPermissionVal.map((element: any) => {
          return {
            role_id,
            permission_id: element.permission_id,
            read: element.read,
            write: element.write,
            update: element.update,
            delete: element.delete,
            created_by: id,
            agency_id: agency_id,
          };
        });

        // console.log(add_permission_body);

        if (add_permission_body.length) {
          await model.createRolePermission(add_permission_body);
        }

        // update section
        if (haveToUpdateVal.length) {
          const update_permission_res = haveToUpdateVal.map(
            async (element: {
              read: 0 | 1;
              write: 0 | 1;
              update: 0 | 1;
              delete: 0 | 1;
              permission_id: number;
            }) => {
              await model.updateRolePermission(
                {
                  read: element.read,
                  update: element.update,
                  write: element.write,
                  delete: element.delete,
                  updated_by: id,
                },
                element.permission_id,
                parseInt(role_id)
              );
            }
          );
          await Promise.all(update_permission_res);
        }
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }

  // Create Admin
  public async createAdmin(req: Request) {
    const { agency_id } = req.agency;

    const files = (req.files as Express.Multer.File[]) || [];
    if (files?.length) {
      req.body[files[0].fieldname] = files[0].filename;
    }
    const { password, email, mobile_number, ...rest } = req.body;
    const model = this.Model.btobAdminModel();

    //check admins email and phone number
    const check_admin = await model.getSingleAdmin({
      email,
    });

    if (check_admin.length) {
      if (check_admin[0].email === email) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: this.ResMsg.EMAIL_EXISTS,
        };
      }
    }

    rest.email = email;
    rest.mobile_number = mobile_number;
    rest.agency_id = agency_id;

    //password hashing
    const hashedPass = await Lib.hashPass(password);
    // create admin
    const create_admin = await model.createAdmin({
      hashed_password: hashedPass,
      ...rest,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      message: this.ResMsg.HTTP_SUCCESSFUL,
    };
  }

  //get all admin
  public async getAllAdmin(req: Request) {
    const { agency_id } = req.agency;
    const model = this.Model.btobAdminModel();
    const data = await model.getAllAdmin(req.query, true, agency_id);
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }

  //get single admin
  public async getSingleAdmin(req: Request) {
    const id = req.params.id;
    const model = this.Model.btobAdminModel();
    const data = await model.getSingleAdmin({ id: Number(id) });

    if (!data.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const { password, ...rest } = data[0];
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: rest,
    };
  }

  //update admin
  public async updateAdmin(req: Request) {
    const id = req.params.id;
    const model = this.Model.btobAdminModel();
    const files = (req.files as Express.Multer.File[]) || [];
    if (files?.length) {
      req.body[files[0].fieldname] = files[0].filename;
    }

    await model.updateUserAdmin(req.body, { id: Number(id) });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: req.body,
    };
  }

  //get audit trail
  public async getAuditTrail(req: Request) {
    const { agency_id } = req.agency;
    const model = this.Model.btobAuditTrailModel();
    const data = await model.getBtoBAudit({agency_id,...req.query});
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }
}

export default BtobAdministrationService;
