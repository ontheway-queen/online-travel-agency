import AbstractRouter from '../../../abstract/abstract.router';
import AdminAirlinesPreferenceController from '../controllers/adminAirlinesPreference.controller';

export class AdminAirlinesPreferenceRouter extends AbstractRouter {
  private controller = new AdminAirlinesPreferenceController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    this.router
      .route('/')
      .post(this.controller.createAirlinePreference)
      .get(this.controller.getAirlinesPreferences);

    this.router
      .route('/:id')
      .patch(this.controller.updateAirlinePreference)
      .delete(this.controller.deleteAirlinePreference);
  }
}
