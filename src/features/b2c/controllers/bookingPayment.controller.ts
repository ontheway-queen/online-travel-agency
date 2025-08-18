import AbstractController from "../../../abstract/abstract.controller";
import { Request, Response } from "express";
import { BookingPaymentServices } from "../services/bookingPayment.service";
export class BookingPaymentController extends AbstractController {
  private service = new BookingPaymentServices();
  constructor() {
    super();
  }

  //create payment
  public createPayment = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createPayment(req);
      res.status(code).json(data);
    }
  );

  // create bkash payment
  public createBkashPayment = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createBkashPayment(req, res);

      res.status(code).json(data);
    }
  );

  // create ssl payment
  public createSSLPayment = this.asyncWrapper.wrap(
    {paramSchema: this.commonValidator.singleParamStringValidator("invoice_id")},
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createSSLPayment(req, res);

      res.status(code).json(data);
    }
  );

  //get transaction
  public getTransaction = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getTransaction(req);
      res.status(code).json(data);
    }
  );

  //get invoice list
  public getInvoice = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getInvoice(req);
      res.status(code).json(data);
    }
  );

  //get invoice single
  public singleInvoice = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamStringValidator("id") },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.singleInvoice(req);
      res.status(code).json(data);
    }
  );
}
