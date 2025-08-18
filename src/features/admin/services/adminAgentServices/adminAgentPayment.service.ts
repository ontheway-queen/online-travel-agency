import { Request } from "express";
import AbstractServices from "../../../../abstract/abstract.service";
import { INVOICE_TYPE_FLIGHT } from "../../../../utils/miscellaneous/constants";


export class AdminAgentPaymentService extends AbstractServices {
    constructor() {
        super();
    }

    //get invoice B2B
    public async getB2BInvoice(req: Request) {
        const model = this.Model.btobPaymentModel();
        const query = req.query;
        const data = await model.getInvoice(query);
        return {
            success: true,
            code: this.StatusCode.HTTP_OK,
            total: data.total,
            data: data.data,
        };
    }

    //get single invoice B2B
    public async getB2BSingleInvoice(req: Request) {
        const model = this.Model.btobPaymentModel();
        const { id: invoice_id } = req.params;
        const data = await model.singleInvoice(Number(invoice_id));
        let flight_data: any = {};

        if (data[0].ref_type === INVOICE_TYPE_FLIGHT) {
            const flightModel = this.Model.b2bFlightBookingModel();
            const flight_res = await flightModel.getSingleFlightBooking({
                id: data[0].ref_id,
            });

            flight_data = {
                base_fare: flight_res[0].base_fare,
                total_tax: flight_res[0].total_tax,
                ait: flight_res[0].ait,
                discount: flight_res[0].discount,
                pnr_code: flight_res[0].pnr_code,
                payable_amount: flight_res[0].payable_amount,
                journey_type: flight_res[0].journey_type,
                total_passenger: flight_res[0].total_passenger,
                route: flight_res[0].route,
            };
        }

        const money_receipt = await model.getMoneyReceipt(Number(invoice_id));

        return {
            success: true,
            code: this.StatusCode.HTTP_OK,
            data: {
                ...data[0],
                flight_data,
                money_receipt: money_receipt.length ? money_receipt : [],
            },
        };
    }

    // b2b partial payment list
    public async getPartialPaymentList(req: Request) {
        const model = this.Model.btobPaymentModel();
        const query = req.query;
        const { data, total } = await model.getPartialPaymentInvoiceList(query);
        return {
            success: true,
            code: this.StatusCode.HTTP_OK,
            total,
            data,
        };
    }
}
