import { Request, Response } from "express";
import AbstractController from "../../../../abstract/abstract.controller";
import { AdminAgentPaymentService } from "../../services/adminAgentServices/adminAgentPayment.service";

export class AdminAgentPaymentController extends AbstractController {
  private services = new AdminAgentPaymentService();
  constructor() {
    super();
  }


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
}
