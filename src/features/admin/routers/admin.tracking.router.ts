import AbstractRouter from '../../../abstract/abstract.router';
import { TrackingController } from '../controllers/admin.tracking.controller';

export class TrackingRouter extends AbstractRouter {
  private trackingController;

  constructor() {
    super();
    this.trackingController = new TrackingController();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route('/')
      .post(
        this.trackingController.createTracking
      )

      .patch(
        this.uploader.cloudUploadRaw(this.fileFolders.VISA_FILES),
        this.trackingController.updateTracking
      );

    this.router.route('/:id').get(this.trackingController.getSingleTracking);
  }
}
