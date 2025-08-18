import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import {
  INVOICE_TYPE_TOUR,
  NOTIFICATION_TYPE_B2B_TOUR_BOOKING,
  PROJECT_CODE,
  TOUR_PACKAGE_EXCLUDE_SERVICE,
  TOUR_PACKAGE_HIGHLIGHT_SERVICE,
  TOUR_PACKAGE_INCLUDE_SERVICE,
} from "../../../utils/miscellaneous/constants";
import { tourPackageBookingFilterQuery } from "../../b2c/utils/types/tourPackageBookingTypes";
import { AdminNotificationSubService } from "../../admin/services/subServices/adminNotificationSubService";

class TourPackageBookingBTOBService extends AbstractServices {
  //create user's tour package booking
  public async createTourPackageBooking(req: Request) {
    return this.db.transaction(async (trx) => {
      const { id: user_id, agency_id } = req.agency;

      const { booking_info, ...rest } = req.body;
      const data = await this.Model.tourPackageModel().getSingleTourPackage(
        req.body.tour_id
      );
      if (!data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: "Tour is not available",
        };
      }

      rest["created_by"] = user_id;
      rest["agency_id"] = agency_id;
      rest["adult_price"] = data[0].b2b_adult_price;
      rest["child_price"] = data[0].b2b_child_price;
      rest["discount"] = data[0].b2b_discount;
      rest["discount_type"] = data[0].b2b_discount_type;

      const price =
        Number(rest.adult_price) * Number(rest.traveler_adult) +
        Number(rest.child_price) * Number(rest.traveler_child);
      const new_price =
        rest.discount_type === "FLAT"
          ? Number(price) - Number(rest.discount)
          : Number(price) - (Number(price) * Number(rest.discount)) / 100;

      const model = this.Model.tourPackageBookingModel(trx);

      //get booking_ref id & increase the number of entry by one
      const last_entry = await this.Model.lastServiceEntryModel(trx).getLastRefId({ type: INVOICE_TYPE_TOUR });
      const booking_ref_id = `${PROJECT_CODE}-T-${(Number(last_entry) + 1).toString().padStart(5, "0")}`;
      rest.booking_ref = booking_ref_id;
      await this.Model.lastServiceEntryModel(trx).incrementLastRefId({ type: INVOICE_TYPE_TOUR });

      const tour_package_info = await model.insertTourPackageBookB2B(rest);

      booking_info["booking_id"] = tour_package_info[0].id;

      await model.insertTourPackageBookContactB2B(booking_info);

      //send notification to admin
      const adminNotificationSubService = new AdminNotificationSubService(trx);
      await adminNotificationSubService.insertNotification({ message: `A new tour booking from B2B. Booking id ${tour_package_info[0].id}`, ref_id: tour_package_info[0].id, type: NOTIFICATION_TYPE_B2B_TOUR_BOOKING });
      //create invoice
      //  const paymentModel = this.Model.paymentModel();
      //  const invoice_data = await paymentModel.getInvoice({ limit: 1 });
      //  let invoice_number;
      //  if (invoice_data.data.length) {
      //    invoice_number = Number(
      //      invoice_data.data[0].invoice_number.split('-')[1]
      //    );
      //  } else {
      //    invoice_number = 0;
      //  }
      //  invoice_number =
      //    'online travel agency-' + (invoice_number + 1).toString().padStart(7, '0');
      //  await paymentModel.insertInvoice({
      //    user_id,
      //    ref_id: tour_package_info[0].id,
      //    ref_type: 'tour',
      //    total_amount: new_price,
      //    due: new_price,
      //    details: `Invoice has been created for tour application id ${tour_package_info[0].id}`,
      //    invoice_number,
      //  });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: "Booking Confirmed Successfully",
      };
    });
  }


  //user's booking history list
  public async getMyBookingHistory(req: Request) {
    const { id, agency_id } = req.agency;
    const { from_travel_date, to_travel_date, title, status, limit, skip } =
      req.query as tourPackageBookingFilterQuery;
    const model = this.Model.tourPackageBookingModel();

    const { data, total } = await model.getAllTourPackageBookingB2B({
      from_travel_date,
      to_travel_date,
      title,
      agency_id,
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

  //single booking info
  public async getSingleBookingInfo(req: Request) {
    const { agency_id } = req.agency;
    const booking_id = Number(req.params.id);
    const model = this.Model.tourPackageBookingModel();

    const data = await model.getSingleBookingInfoB2B(booking_id, agency_id);
    if (!data) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }
    const tour_id = data?.tour_id;
    const photos = await this.Model.tourPackageModel().getTourPhotos(tour_id);
    const include_services =
      await this.Model.tourPackageModel().getTourServices(
        tour_id,
        TOUR_PACKAGE_INCLUDE_SERVICE
      );
    const exclude_services =
      await this.Model.tourPackageModel().getTourServices(
        tour_id,
        TOUR_PACKAGE_EXCLUDE_SERVICE
      );
    const highlight_services =
      await this.Model.tourPackageModel().getTourServices(
        tour_id,
        TOUR_PACKAGE_HIGHLIGHT_SERVICE
      );
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: {
        ...data,
        photos,
        include_services,
        exclude_services,
        highlight_services,
      },
    };
  }
}

export default TourPackageBookingBTOBService;
