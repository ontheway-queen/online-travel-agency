import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import { CorporatePackageService } from '../services/admin.corporatePackage.service';

export class CorporatePackageController extends AbstractController {
  private corporatePackageService = new CorporatePackageService();

  constructor() {
    super();
  }

  public insertCorporatePackagePageInfoController = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } =
        await this.corporatePackageService.insertCorporatePackageTravelPageInfo(
          req
        );

      res.status(code).json(rest);
    }
  );

  public getDataForCorporatePackagePage = this.asyncWrapper.wrap(
    null,
    async(req:Request,res:Response)=>{
      const {code, ...rest} = await this.corporatePackageService.getDataForCorporatePackagePage()
      res.status(code).json(rest);
    }
  )

  public updateCorporateTravelPageData = this.asyncWrapper.wrap(
    null,
    async(req:Request,res:Response)=>{
      const {code, ...rest} = await this.corporatePackageService.updateCorporateTravelPageData(req)
      res.status(code).json(rest);
    }
  )
}
