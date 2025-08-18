import AbstractServices from '../../../abstract/abstract.service';
import { Request } from 'express';

export class B2CUmrahPackageService extends AbstractServices {
 
  constructor() {
    super();
    
  }

  //get all umrah package for b2c
  public async getAllUmrahPackageForB2C(req: Request) {
    const model = this.Model.umrahPackageModel();
    const { to_date, duration, min_price, max_price } =
      req.query as unknown as {
        to_date: Date;
        duration: number;
        min_price: number;
        max_price: number;
      };

    const {umrahPackageWithImage,umrahPackageCount} = await model.getAllUmrahPackageForB2C({
      to_date,
      duration,
      min_price,
      max_price,
    });

    

    if (!umrahPackageWithImage) {
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
      total:umrahPackageCount[0].count,
      data: umrahPackageWithImage,
    };
  }

  // Get Single Umrah Package For B2C
  public async getSingleUmrahPackageForB2C(req: Request) {
   const model = this.Model.umrahPackageModel();
    const { slug } = req.params as unknown as {
      slug: string;
    };
    // console.log(slug)
    const singlePackage = await model.getSingleUmrahPackageForB2C(slug);
    if (!singlePackage) {
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
      data: singlePackage,
    };
  }

  // Get City Name
  public async getCityName(req: Request) {
    const model = this.Model.umrahPackageModel();
    const city = await model.getCityName();
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: city,
    };
  }
}
