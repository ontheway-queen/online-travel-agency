import { Request, Response } from "express";
import AbstractController from "../../../abstract/abstract.controller";
import { PaymentService } from "../services/adminPayment.service";
import { AdminAgentPaymentValidator } from "../utils/validators/adminAgentValidators/adminAgentPayment.validator";

export class PaymentController extends AbstractController {
  private services = new PaymentService();
  private validator = new AdminAgentPaymentValidator();
  constructor() {
    super();
  }

  //get invoice list for admin
  public getB2CInvoiceList = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getB2CInvoiceList(req);
      res.status(code).json(rest);
    }
  );

  // get single invoice for admin
  public getB2CSingleInvoice = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getB2CSingleInvoice(req);
      res.status(code).json(rest);
    }
  );

  //get invoice list for admin
  public getB2BInvoiceList = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getB2BInvoice(req);
      res.status(code).json(rest);
    }
  );

  // get single invoice for admin
  public getB2BSingleInvoice = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getB2BSingleInvoice(req);
      res.status(code).json(rest);
    }
  );

  // get partial payment list
  public getPartialPaymentList = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getPartialPaymentList(req);
      res.status(code).json(rest);
    }
  );

  public giveAgencyLoan = this.asyncWrapper.wrap(
    { bodySchema: this.validator.giveAgencyLoanValidator },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.giveAgencyLoan(req);
      res.status(code).json(rest);
    }
  );

  public getAgenciesWithLoan = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getAgenciesWithLoan(req);
      res.status(code).json(rest);
    }
  );

  public getAgencyLoanHistory = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getAgencyLoanHistory(req);
      res.status(code).json(rest);
    }
  );

  public adjustAgencyLoan = this.asyncWrapper.wrap(
    { bodySchema: this.validator.adjustAgencyLoanValidator },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.adjustAgencyLoan(req);
      res.status(code).json(rest);
    }
  );

  //=========================== agency loan ===========================//

  public getLoanRequest = this.asyncWrapper.wrap(
    { querySchema: this.validator.getLoanRequestQuery },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getLoanRequest(req);
      res.status(code).json(rest);
    }
  );

  public updateLoanRequest = this.asyncWrapper.wrap(
    {
      bodySchema: this.validator.updateLoanReq,
      paramSchema: this.commonValidator.singleParamValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.updateLoanRequest(req);
      res.status(code).json(rest);
    }
  );

  public clearPartialPaymentDue = this.asyncWrapper.wrap(
    { paramSchema: this.commonValidator.singleParamValidator },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.clearPartialPaymentDue(req);
      res.status(code).json(rest);
    }
  );

  // payment link
  public createPaymentLink = this.asyncWrapper.wrap(
    { bodySchema: this.commonValidator.createPaymentLink },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.createPaymentLink(req);
      res.status(code).json(rest);
    }
  );

  // get payment links
  public getPaymentLinks = this.asyncWrapper.wrap(
    null,
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getAllPaymentLink(req);
      res.status(code).json(rest);
    }
  );
}
