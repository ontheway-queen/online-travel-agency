import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';

export class CorporatePackageService extends AbstractServices {
  constructor() {
    super();
  }

  public async insertCorporatePackageTravelPageInfo(req: Request) {
    const model = this.Model.corporateTravelModel();

    const { tour_package, video } = req.body;
    const files = (req.files as Express.Multer.File[]) || [];

    const tour_package_parse = JSON.parse(tour_package);
    const video_parse: [] = JSON.parse(video);

    if (files.length) {
      Promise.all(
        files.map(async (file: any) => {
          await model.insertBannerImage(file.filename);
        })
      );
    }

    if (tour_package_parse.length) {
      Promise.all(
        tour_package_parse.map(async (tour: any) => {
          await model.insertTourinfo({
            tour_id: tour.tour_id,
            tour_type: tour.tour_type,
          });
        })
      );
    }

    if (video_parse.length) {
      Promise.all(
        video_parse.map(async (obj: any) => {
          await model.insertVideo(obj);
        })
      );
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      message: this.ResMsg.HTTP_SUCCESSFUL,
    };
  }

  public async getDataForCorporatePackagePage() {
    const model = this.Model.corporateTravelModel();
    const tourPackage = await model.getDataForCorporatePackagePage();
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: tourPackage,
    };
  }

  public async updateCorporateTravelPageData(req: Request) {
    const model = this.Model.corporateTravelModel();
    const { packages, videos, banners } = req.body;

    // console.log(packages, videos, banners);

    if (packages.length) {
      Promise.all(
        packages.map(async (obj: { id: number; status: boolean }) => {
          await model.updatePackageList(obj);
        })
      );
    }

    if (videos.length) {
      Promise.all(
        videos.map(async (obj: { id: number; status: boolean }) => {
          await model.updateVideoList(obj);
        })
      );
    }

    if (banners.length) {
      Promise.all(
        banners.map(async (obj: { id: number; status: boolean }) => {
          await model.updateBannerImageList(obj);
        })
      );
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
    };
  }
}
