"use strict";
// import AbstractController from '../../../abstract/abstract.controller';
// import { Request, Response } from 'express';
// import { B2CUmrahPackageBookingService } from '../services/btocUmrahPackageBooking.service';
// export class B2CUmrahPackageBookingController extends AbstractController {
//   private service = new B2CUmrahPackageBookingService();
//   constructor() {
//     super();
//   }
//   public getAllFixedPackageRequest = this.asyncWrapper.wrap(
//     null,
//     async (req: Request, res: Response) => {
//       const { code, ...data } = await this.service.getAllFixedPackageRequest(
//         req
//       );
//       res.status(code).json(data);
//     }
//   );
//   public getAllCustomizePackageRequest = this.asyncWrapper.wrap(
//     null,
//     async (req: Request, res: Response) => {
//       const { code, ...data } =
//         await this.service.getAllCustomizePackageRequest();
//       res.status(code).json(data);
//     }
//   );
// }
