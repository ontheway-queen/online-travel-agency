import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import { AdminReportService } from '../services/admin.report.service';
import { AdminReportValidator } from '../utils/validators/admin.report.validator';

export class AdminReportController extends AbstractController {
  private service = new AdminReportService();
  private validator = new AdminReportValidator();
  constructor() {
    super();
  }

  public getB2CPaymentTransactionReport = this.asyncWrapper.wrap(
    {
      querySchema: this.validator.B2CPaymentTransactionReportQueryValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getB2CPaymentTransactionReport(req);
      res.status(code).json(data);
    }
  );

  public getB2BTopUpReport = this.asyncWrapper.wrap(
    {
      querySchema: this.validator.B2BTopUpReportQueryValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getB2BTopUpReport(req);
      res.status(code).json(data);
    }
  );

  public getB2BLedgerReport = this.asyncWrapper.wrap(
    {
      querySchema: this.validator.B2BLedgerReportQueryValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getB2BLedgerReport(req);
      res.status(code).json(data);
    }
  );

  public getB2BSalesReport = this.asyncWrapper.wrap(
    {
      querySchema: this.validator.B2BSalesReportQueryValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getB2BSalesReport(req);
      res.status(code).json(data);
    }
  )


  public getB2BTicketWiseReport = this.asyncWrapper.wrap(
    {
      querySchema: this.validator.B2BTicketWiseReportQueryValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getB2BTicketWiseReport(req);
      res.status(code).json(data);
    }
  )


  public getB2BFlightBookingReport = this.asyncWrapper.wrap(
    {
      querySchema: this.validator.B2BFlightBookingReportQueryValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getB2BFlightBookingReport(req);
      res.status(code).json(data);
    }
  )

  public getB2CFlightBookingReport = this.asyncWrapper.wrap(
    {
      querySchema: this.validator.B2CFlightBookingReportQueryValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...data } = await this.service.getB2CFlightBookingReport(req);
      res.status(code).json(data);
    }
  )
}
