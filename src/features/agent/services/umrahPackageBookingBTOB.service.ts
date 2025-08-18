import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';

// import { tourPackageBookingFilterQuery } from "../../b2c/utils/types/tourPackageBookingTypes";

class UmrahPackageBookingBTOBService extends AbstractServices {
  //create umrah package booking for b2b
  public async createUmrahPackageBooking(req: Request) {
    return this.db.transaction(async (trx) => {
      const bookingModel = this.Model.umrahPackageBookinModel(trx);
      const packageModel = this.Model.umrahPackageModel(trx);
      const paymentModel = this.Model.paymentModel(trx);
      const { booking_info, umrah_id, ...rest } = req.body;
      const { id: user_id, agency_id } = req.agency;
      const umrahPackage = await packageModel.getSingleUmrahPackage(umrah_id);

      rest['user_id'] = user_id;
      rest['agency_id'] = agency_id;
      rest['price_per_person'] = umrahPackage.b2b_price_per_person;
      rest['discount'] = umrahPackage.b2b_discount;
      rest['discount_type'] = umrahPackage.b2b_discount_type;

      if (!umrahPackage)
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };

      const { b2b_price_per_person, b2b_discount, b2b_discount_type } =
        umrahPackage;

      const price = Number(b2b_price_per_person) * Number(rest.traveler_adult);

      const new_price =
        b2b_discount_type === 'FLAT'
          ? Number(price) - Number(b2b_discount)
          : Number(price) - (Number(price) * Number(b2b_discount)) / 100;

      const umrah_package_booking =
        await bookingModel.insertUmrahPackageBookingB2B({
          umrah_id,
          agency_id,
          created_by: user_id,
          traveler_adult: rest.traveler_adult,
          traveler_child: rest.traveler_child,
          note_from_customer: rest.note_from_customer,
          travel_date: rest.travel_date,
          double_room: rest.double_room,
          twin_room: rest.twin_room,
          price_per_person: rest.price_per_person,
          discount: rest.discount,
          discount_type: rest.discount_type,
        });

      const booking_id = Number(umrah_package_booking[0].id);

      await bookingModel.insertUmrahPackageBookingContactB2B({
        booking_id,
        ...booking_info,
      });

      //create invoice
      const invoice_data = await paymentModel.getInvoice({ limit: 1 });

      let invoice_number: any = 0;

      if (invoice_data.data.length) {
        invoice_number = Number(
          invoice_data.data[0].invoice_number.split('-')[1]
        );
      } else {
        invoice_number = 0;
      }

      invoice_number =
        'online travel agency-' + (invoice_number + 1).toString().padStart(7, '0');

      await paymentModel.insertInvoice({
        user_id,
        ref_id: booking_id,
        ref_type: 'umrah',
        total_amount: new_price,
        due: new_price,
        details: `Invoice has been created for umrah application id ${booking_id}`,
        invoice_number,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }

  //user's booking history list
  public async getAgencyBookingHistory(req: Request) {
    const { agency_id } = req.agency;
    const { limit, skip } = req.query as unknown as {
      limit: number;
      skip: number;
    };

    const model = this.Model.umrahPackageBookinModel();

    const { history, historyCount } = await model.getAgencyBookingHistory({
      agency_id,
      limit,
      skip,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      total: historyCount[0].count,
      data: history,
    };
  }

  //single booking info
  public async getSingleBooking(req: Request) {
    const { id } = req.params;

    if (isNaN(Number(id))) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: this.ResMsg.HTTP_BAD_REQUEST,
        error: 'Invalid id',
      };
    }

    const model = this.Model.umrahPackageBookinModel();

    const data = await model.getSingleBTOBBooking(Number(id));

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: data,
    };
  }
}

export default UmrahPackageBookingBTOBService;
