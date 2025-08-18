import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { tourPackageFilterQuery } from "../../../utils/interfaces/tourPackage/tourPackageInterface";
import {
  TOUR_PACKAGE_EXCLUDE_SERVICE,
  TOUR_PACKAGE_HIGHLIGHT_SERVICE,
  TOUR_PACKAGE_INCLUDE_SERVICE,
} from "../../../utils/miscellaneous/constants";

class TourPackageBTOBService extends AbstractServices {
  // get Tour Package List
  public async tourPackageList(req: Request) {
    const model = this.Model.tourPackageModel();
    const query = req.query;
    const data = await model.getTourPackageListV2({ ...query, s_type: "b2b" });

    // Fetch reviews for each tour package
    // const tourPackagesWithReviews = await Promise.all(
    //   data.data.map(async (tourPackage) => {
    //     const review = await model.getReview(tourPackage.id);
    //     return {
    //       ...tourPackage,
    //       review_count: review.count || 0,
    //       average_rating: review.average || 0,
    //     };
    //   })
    // );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }

  //get single tour package
  public async getSingleTourPackage(req: Request) {
    const id = Number(req.params.id);

    const data = await this.Model.tourPackageModel().getSingleTourPackage(id);
    const photos = await this.Model.tourPackageModel().getTourPhotos(id);
    const include_services =
      await this.Model.tourPackageModel().getTourServices(
        id,
        TOUR_PACKAGE_INCLUDE_SERVICE
      );
    const exclude_services =
      await this.Model.tourPackageModel().getTourServices(
        id,
        TOUR_PACKAGE_EXCLUDE_SERVICE
      );
    const highlight_services =
      await this.Model.tourPackageModel().getTourServices(
        id,
        TOUR_PACKAGE_HIGHLIGHT_SERVICE
      );

    // const reviews = await this.Model.tourPackageModel().getAllTourPackesReview({
    //   tour_id: id,
    // });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: {
        ...data[0],
        photos,
        include_services,
        exclude_services,
        highlight_services,
        // reviews,
      },
    };
  }
}

export default TourPackageBTOBService;
