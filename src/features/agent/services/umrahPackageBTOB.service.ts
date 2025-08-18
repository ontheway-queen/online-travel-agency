import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import { tourPackageFilterQuery } from '../../../utils/interfaces/tourPackage/tourPackageInterface';
import {
  TOUR_PACKAGE_EXCLUDE_SERVICE,
  TOUR_PACKAGE_HIGHLIGHT_SERVICE,
  TOUR_PACKAGE_INCLUDE_SERVICE,
} from '../../../utils/miscellaneous/constants';

class UmrahPackageBTOBService extends AbstractServices {
  // get Tour Package List
  public async umrahPackageList(req: Request) {
    const model = this.Model.umrahPackageModel();
    const { to_date, duration, min_price, max_price } =
      req.query as unknown as {
        to_date: Date;
        duration: number;
        min_price: number;
        max_price: number;
      };
    const {umrahPackageCount,umrahPackageWithImage} = await model.getAllUmrahPackageForB2B({
      to_date,
      duration,
      min_price,
      max_price,
    });


    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
        total: umrahPackageCount[0].count,
        data:umrahPackageWithImage,
    };
  }

  //get single tour package
  public async getSingleUmrahPackage(req: Request) {
    const id = Number(req.params.id);

    const model = this.Model.umrahPackageModel()
    const data = await model.getSingleUmrahPackageForB2B(id)

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: data
    };
  }
}

export default UmrahPackageBTOBService;
