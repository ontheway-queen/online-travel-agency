import AbstractController from "../../../abstract/abstract.controller";
import { Request, Response } from "express";
import { BookingPaymentServices } from "../services/bookingPayment.service";
import { AgentPaymentValidator } from "../utils/validators/payment.validator";
export class BookingPaymentController extends AbstractController {
  private service = new BookingPaymentServices();
  private validator = new AgentPaymentValidator();
  constructor() {
    super();
  }

  //create payment
  public CreateB2bBkashPayment = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.CreateB2bBkashPayment(
        req,
        res
      );
      res.status(code).json(data);
    }
  );

  //create payment ssl
  public createSSLPayment = this.asyncWrapper.wrap(
    {bodySchema: this.validator.topupSchema},
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createSSLPayment(
        req
      );
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
  //get invoice
  public getInvoice = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getInvoice(req);
      res.status(code).json(data);
    }
  );
  //get single invoice
  public getSingleInvoice = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getSingleInvoice(req);
      res.status(code).json(data);
    }
  );

  //clear invoice due
  public clearInvoiceDue = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.clearInvoiceDue(req);
      res.status(code).json(data);
    }
  );

  // partial payment history
  public getPartialPaymentList = this.asyncWrapper.wrap(
    {},
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getPartialPaymentList(req);
      res.status(code).json(data);
    }
  );

  // total partial payment amount
  public getPartialPaymentTotalDue = this.asyncWrapper.wrap(
    {},
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getPartialPaymentTotalDue(
        req
      );
      res.status(code).json(data);
    }
  );

  // clear loan
  public clearLoan = this.asyncWrapper.wrap(
    { bodySchema: this.validator.clearLoan },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.clearLoan(req);
      res.status(code).json(data);
    }
  );

  // deposit by gateway
  public createDepositOrderByBracGateway = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...data } =
        await this.service.createDepositOrderByBracGateway(req);
      res.status(code).json(data);
    }
  );

  //============================= LOAN REQUEST ==================================//
  // create loan request
  public createLoanRequest = this.asyncWrapper.wrap(
    { bodySchema: this.validator.createLoanRequest },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.createLoanRequest(req);
      res.status(code).json(data);
    }
  );
  // get loan request
  public getLoanRequest = this.asyncWrapper.wrap(
    {},
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getLoanRequest(req);
      res.status(code).json(data);
    }
  );
  // get loan history
  public getLoanHistory = this.asyncWrapper.wrap(
    {},
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getLoanHistory(req);
      res.status(code).json(data);
    }
  );
}
