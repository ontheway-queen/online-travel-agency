import AbstractRouter from '../../../abstract/abstract.router';
import { AdminBtoCBookingSupportController } from '../controllers/admin.b2cBookingSupport.controller';

export class AdminBtoCBookingSupportRouter extends AbstractRouter {
  private controller = new AdminBtoCBookingSupportController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // get
    this.router.route('/').get(this.controller.getList);
    // create message, get single, close support
    this.router
      .route('/:id')
      .get(this.controller.getDetails)
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.USER_FILES),
        this.controller.createMessage
      )
      .delete(this.controller.closeSupport);
  }
}
