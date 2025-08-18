import AbstractRouter from '../../../abstract/abstract.router';
import AgentFlightController from '../controllers/agentFlight.controller';

export default class AgentFlightRouter extends AbstractRouter {
  private controller = new AgentFlightController();
  constructor() {
    super();
    this.callRouter();
  }

  private callRouter() {
    // search flight
    this.router.route('/search').post(this.controller.flightSearch);

    //flight search using sse
    this.router.route('/search/sse').get(this.controller.FlightSearchSSE);

    //airline list
    this.router.route('/airlines').get(this.controller.getAirlineList);

    //flight revalidate
    this.router.route('/revalidate').get(this.controller.flightRevalidate);

    //fare rules
    this.router.route('/fare-rules').get(this.controller.getFlightFareRule);

    //flight booking
    this.router
      .route('/booking')
      .post(
        this.uploader.cloudUploadRaw(this.fileFolders.AGENT_FLIGHT_BOOKING_FILES),
        this.controller.flightBooking
      )
      .get(this.controller.getBookingList);

    //flight booking cancel
    this.router
      .route('/booking/:id')
      .delete(this.controller.flightBookingCancel)
      .get(this.controller.getBookingSingle);

    //ticket issue
    this.router.route('/ticket-issue/:id').post(this.controller.ticketIssue);
  }
}
