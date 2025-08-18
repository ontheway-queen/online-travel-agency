import AbstractRouter from '../../../abstract/abstract.router';
import { ManualBankTransferController } from '../controllers/admin.manualBankTransfer.controller';

export class ManualBankTransferRouter extends AbstractRouter {
  private controller = new ManualBankTransferController();
  constructor() {
    super();
    this.callRouter();
  }
  callRouter() {
    this.router
      .route('/')
      //get all manual bank transfer list
      .get(this.controller.getManualBankTransferList)

    this.router
      .route('/:id')
      //get single manual bank transfer
      .get(this.controller.getSingleManualBankTransfer)
      //update manual bank transfer
      .patch(
        this.controller.updateManualBankTransfer
      );
  }
}
