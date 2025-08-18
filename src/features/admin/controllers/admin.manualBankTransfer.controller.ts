import { Request, Response } from 'express';
import AbstractController from '../../../abstract/abstract.controller';
import { ManualBankTransferService } from '../services/admin.manualBankTransfer.service';
import { ManualBankTransferValidator } from '../utils/validators/admin.manualBankTransfer.validator';

export class ManualBankTransferController extends AbstractController {
  private services = new ManualBankTransferService();
  private validator = new ManualBankTransferValidator();
  constructor() {
    super();
  }

  //get manual bank transfer list
  public getManualBankTransferList = this.asyncWrapper.wrap(
    {
      querySchema: this.validator.getManualBankTransferSchema,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getManualBankTransferList(
        req
      );
      res.status(code).json(rest);
    }
  );


  //get single manual bank transfer
  public getSingleManualBankTransfer = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.getSingleManualBankTransfer(
        req
      );
      res.status(code).json(rest);
    }
  )

  //update manual bank transfer
  public updateManualBankTransfer = this.asyncWrapper.wrap(
    {
      paramSchema: this.commonValidator.singleParamValidator,
      bodySchema: this.validator.updateManualBankTransferSchema,
    },
    async (req: Request, res: Response) => {
      const { code, ...rest } = await this.services.updateManualBankTransfer(
        req
      );
      res.status(code).json(rest);
    }
  );

}
