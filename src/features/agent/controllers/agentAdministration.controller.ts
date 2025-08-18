import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import BtobAdministrationValidator from '../../admin/utils/validators/btob.administration.validator';
import BtobAdministrationService from '../services/btob.administration.service';

class BtobAdministrationController extends AbstractController {
  private AdministrationService = new BtobAdministrationService();
  private AdministrationValidator = new BtobAdministrationValidator();

  constructor() {
    super();
  }

  //create role
  public createRole = this.asyncWrapper.wrap(
    { bodySchema: this.AdministrationValidator.createRole },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.AdministrationService.createRole(
        req
      );
      res.status(code).json(data);
    }
  );

  //role list
  public roleList = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.AdministrationService.roleList(req);
      res.status(code).json(data);
    }
  );

  //permission list
  public permissionList = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.AdministrationService.permissionList(
        req
      );
      res.status(code).json(data);
    }
  );

   //create permission
   public createPermission = this.asyncWrapper.wrap(
    { bodySchema: this.AdministrationValidator.createPermission },
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.AdministrationService.createPermission(req);
      res.status(code).json(data);
    }
  );

  //get single role permission
  public getSingleRolePermission = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.AdministrationService.getSingleRolePermission(req);
      res.status(code).json(data);
    }
  );

  //update role permission
  public updateRolePermissions = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
      bodySchema: this.AdministrationValidator.updateRolePermissions,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.AdministrationService.updateRolePermissions(req);
      res.status(code).json(data);
    }
  );

  //create admin
  public createAdmin = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.AdministrationService.createAdmin(
        req
      );
      res.status(code).json(data);
    }
  );

  //get all admin
  public getAllAdmin = this.asyncWrapper.wrap(
    { querySchema: this.AdministrationValidator.getAllAdminQueryValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.AdministrationService.getAllAdmin(
        req
      );
      res.status(code).json(data);
    }
  );

  //get single admin
  public getSingleAdmin = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.AdministrationService.getSingleAdmin(
        req
      );
      res.status(code).json(data);
    }
  );

  //update admin
  public updateAdmin = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.AdministrationService.updateAdmin(
        req
      );
      res.status(code).json(data);
    }
  );
  
  //get audit
  public getAuditTrail = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.AdministrationService.getAuditTrail(
        req
      );
      res.status(code).json(data);
    }
  );
}

export default BtobAdministrationController;
