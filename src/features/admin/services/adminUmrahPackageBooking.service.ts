import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import { tourPackageBookingFilterQuery } from "../../b2c/utils/types/tourPackageBookingTypes";
import {
  TOUR_PACKAGE_EXCLUDE_SERVICE,
  TOUR_PACKAGE_HIGHLIGHT_SERVICE,
  TOUR_PACKAGE_INCLUDE_SERVICE,
} from "../../../utils/miscellaneous/constants";
import { umrahPackageBookingFilterQuery } from "../../b2c/utils/types/umrahPackageBookingTypes";

export class AdminUmrahPackageBookingService extends AbstractServices {
  constructor() {
    super();
  }

  //get tour package list
  public async getAllUmrahPackageBooking(req: Request) {
    const {
      from_travel_date,
      to_travel_date,
      title,
      user_name,
      status,
      user_id,
      limit,
      skip,
    } = req.query as umrahPackageBookingFilterQuery;
    const model = this.Model.umrahPackageBookinModel();
    const { data, total } = await model.getAllUmrahPackageBooking({
      from_travel_date,
      to_travel_date,
      title,
      user_name,
      user_id,
      status,
      limit,
      skip,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      total,
      data: data,
    };
  }

  //update tour package booking
  public async updateUmrahPackage(req: Request) {
    return this.db.transaction(async (trx) => {
      const booking_id = Number(req.params.id);
      const { status } = req.body;

      const model = this.Model.umrahPackageBookinModel(trx);

      //update single booking
      if (status) {
        await model.updateSingleBooking(booking_id, {status:status});
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Booking Updated Successfully",
      };
    });
  }

  //single booking info
  public async getSingleBookingInfo(req: Request) {
    const booking_id = Number(req.params.id);
    const model = this.Model.umrahPackageBookinModel();

    const data = await model.getSingleBooking(booking_id);
    if (!data) {
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
      data: data
    };
  }

  //get tour package list b2b
  // public async getAllUmrahPackageBookingB2B(req: Request) {
  //   const { from_travel_date, to_travel_date, title, status, limit, skip } =
  //     req.query as tourPackageBookingFilterQuery;
  //   const model = this.Model.tourPackageBookingModel();

  //   const { data, total } = await model.getAllTourPackageBookingB2B({
  //     from_travel_date,
  //     to_travel_date,
  //     title,
  //     status,
  //     limit,
  //     skip,
  //   });

  //   return {
  //     success: true,
  //     code: this.StatusCode.HTTP_OK,
  //     message: this.ResMsg.HTTP_OK,
  //     total,
  //     data: data,
  //   };
  // }




  //single booking info b2b
  // public async getSingleBookingInfoB2B(req: Request) {
  //   const booking_id = Number(req.params.id);
  //   const model = this.Model.tourPackageBookingModel();

  //   const data = await model.getSingleBookingInfoB2B(booking_id);
  //   if (!data) {
  //     return {
  //       success: false,
  //       code: this.StatusCode.HTTP_NOT_FOUND,
  //       message: this.ResMsg.HTTP_NOT_FOUND,
  //     };
  //   }
  //   const tour_id = data?.tour_id;
  //   const photos = await this.Model.tourPackageModel().getTourPhotos(tour_id);
  //   const include_services =
  //     await this.Model.tourPackageModel().getTourServices(
  //       tour_id,
  //       TOUR_PACKAGE_INCLUDE_SERVICE
  //     );
  //   const exclude_services =
  //     await this.Model.tourPackageModel().getTourServices(
  //       tour_id,
  //       TOUR_PACKAGE_EXCLUDE_SERVICE
  //     );
  //   const highlight_services =
  //     await this.Model.tourPackageModel().getTourServices(
  //       tour_id,
  //       TOUR_PACKAGE_HIGHLIGHT_SERVICE
  //     );
  //   return {
  //     success: true,
  //     code: this.StatusCode.HTTP_OK,
  //     message: this.ResMsg.HTTP_OK,
  //     data: {
  //       ...data,
  //       photos,
  //       include_services,
  //       exclude_services,
  //       highlight_services,
  //     },
  //   };
  // }

  //update Umrah package booking b2b
  // public async updateUmrahPackageB2B(req: Request) {
  //   return this.db.transaction(async (trx) => {
  //     const booking_id = Number(req.params.id);
  //     const { booking_info, ...rest } = req.body;

  //     const model = this.Model.tourPackageBookingModel(trx);

  //     //update single booking
  //     if (rest) {
  //       await model.updateSingleBookingB2B(booking_id, rest);
  //     }

  //     //update single booking user info
  //     if (booking_info) {
  //       await model.updateSingleBookingContactB2B(booking_id, booking_info);
  //     }

  //     return {
  //       success: true,
  //       code: this.StatusCode.HTTP_SUCCESSFUL,
  //       message: "Booking Updated Successfully",
  //     };
  //   });
  // }
}
