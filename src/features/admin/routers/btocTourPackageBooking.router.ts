// import AbstractRouter from "../../../abstract/abstract.router"
// import { B2CTourPackageBookingController } from "../controllers/btocTourPackageBooking.controller";


// export class B2CTourPackageBookingRouter extends AbstractRouter{
//     private tourPackageBookingController;
//   constructor() {
//     super();
//     this.tourPackageBookingController = new B2CTourPackageBookingController();
//     this.callRouter();
//   }

//   public callRouter(){
//     this.router.route("/fixed-package").get(this.tourPackageBookingController.getAllFixedPackageRequest)
//     this.router.route("/customize-package").get(this.tourPackageBookingController.getAllCustomizePackageRequest)
//   }
// }