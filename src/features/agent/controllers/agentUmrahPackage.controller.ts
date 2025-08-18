import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import UmrahPackageBTOBService from '../services/umrahPackageBTOB.service';

export class UmrahPackageBTOBController extends AbstractController {
  private service = new UmrahPackageBTOBService();
//   private validator = new TourPackageValidator();

  //get all umrah package
  public umrahPackageList = this.asyncWrapper.wrap(
    null,

    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.umrahPackageList(req);
      res.status(code).json(rest);
    }
  );

  //get single umrah package
  public singleUmrahPackage = this.asyncWrapper.wrap(
    // { querySchema: this.validator.tourPackageFilterQueryValidator },
    null,

    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.service.getSingleUmrahPackage(req);
      res.status(code).json(rest);
    }
  );
}
