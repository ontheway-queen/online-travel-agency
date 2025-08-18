import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import { tourPackageBookingFilterQuery } from '../../b2c/utils/types/tourPackageBookingTypes';
import {
  TOUR_PACKAGE_EXCLUDE_SERVICE,
  TOUR_PACKAGE_HIGHLIGHT_SERVICE,
  TOUR_PACKAGE_INCLUDE_SERVICE,
} from '../../../utils/miscellaneous/constants';

export class AdminTourPackageBookingService extends AbstractServices {
  constructor() {
    super();
  }

  //get tour package list
  public async getAllTourPackageBooking(req: Request) {
    const {
      from_travel_date,
      to_travel_date,
      title,
      user_name,
      status,
      user_id,
      limit,
      skip,
    } = req.query as tourPackageBookingFilterQuery;
    const model = this.Model.tourPackageBookingModel();
    const { data, total } = await model.getAllTourPackageBooking({
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
  public async updateTourPackage(req: Request) {
    return this.db.transaction(async (trx) => {
      const booking_id = Number(req.params.id);
      const { booking_info, ...rest } = req.body;

      const model = this.Model.tourPackageBookingModel(trx);

      //update single booking
      if (rest) {
        await model.updateSingleBooking(booking_id, rest);
      }

      //update single booking user info
      if (booking_info) {
        await model.updateSingleBookingContact(booking_id, booking_info);
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: 'Booking Updated Successfully',
      };
    });
  }

  //single booking info
  public async getSingleBookingInfo(req: Request) {
    const booking_id = Number(req.params.id);
    const model = this.Model.tourPackageBookingModel();
    const paymentModel = this.Model.paymentModel();

    const data = await model.getSingleBookingInfo(booking_id);
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

    const invoice_data = await paymentModel.getInvoiceByBookingId(
      Number(booking_id),
      'tour'
    );
    const payment_data = await paymentModel.singleMoneyReceipt(
      invoice_data[0].id
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: {
        ...data,
        invoice_data,
        payment_data,
        photos,
        include_services,
        exclude_services,
        highlight_services,
      },
    };
  }

  //get tour package list b2b
  public async getAllTourPackageBookingB2B(req: Request) {
    const { from_travel_date, to_travel_date, title, status, limit, skip } =
      req.query as tourPackageBookingFilterQuery;
    const model = this.Model.tourPackageBookingModel();

    const { data, total } = await model.getAllTourPackageBookingB2B({
      from_travel_date,
      to_travel_date,
      title,
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

  //single booking info b2b
  public async getSingleBookingInfoB2B(req: Request) {
    const booking_id = Number(req.params.id);
    const model = this.Model.tourPackageBookingModel();

    const data = await model.getSingleBookingInfoB2B(booking_id);
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

  //update tour package booking b2b
  public async updateTourPackageB2B(req: Request) {
    return this.db.transaction(async (trx) => {
      const booking_id = Number(req.params.id);

      const { status } = req.body;

      const model = this.Model.tourPackageBookingModel(trx);
      const agencyModel = this.Model.agencyModel(trx);

      const data = await model.getSingleBookingInfoB2B(booking_id);

      //update single booking
      if (data.status == 'PENDING') {
        if (status === 'APPROVED') {
          const data = await model.getSingleBookingInfoB2B(booking_id);

          //check balance
          const balance = await agencyModel.getTotalBalance(data.agency_id);

          const price =
            Number(data.adult_price) * Number(data.traveler_adult) +
            Number(data.child_price) * Number(data.traveler_child);

          const new_price =
            data.discount_type === 'FLAT'
              ? Number(price) - Number(data.discount)
              : Number(price) - (Number(price) * Number(data.discount)) / 100;

          if (Number(new_price) > Number(balance)) {
            return {
              success: false,
              code: this.StatusCode.HTTP_BAD_REQUEST,
              message: 'There is insufficient balance in agency account',
            };
          }

          //debit amount
          await agencyModel.insertAgencyLedger({
            agency_id: data.agency_id,
            type: 'debit',
            amount: new_price,
            details: `Debit for tour booking - Booking ID: ${booking_id}.`,
          });
        }
        await model.updateSingleBookingB2B(booking_id, { status: status });
      } else {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: 'Booking is already approved or cancelled',
        };
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: 'Booking Updated Successfully',
      };
    });
  }
}
