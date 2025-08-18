import AbstractRouter from '../../../abstract/abstract.router';
import { ManualBankTransferController } from '../controllers/manualBankTransfer.controller';

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

      //create manual bank transfer
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.BANK_INVOICE_FILES),
        this.controller.createManualBankTransfer
      );

    this.router
      .route('/:id')
      //get single manual bank transfer
      .get(this.controller.getSingleManualBankTransfer)
      //update manual bank transfer
      // .patch(
      //   this.uploader.cloudUploadRaw(this.fileFolders.BANK_INVOICE_FILES),
      //   this.controller.updateManualBankTransfer
      // );
  }
}
