"use strict";
// import { Request } from 'express';
// import AbstractServices from '../../../abstract/abstract.service';
// export class B2CUmrahPackageBookingService extends AbstractServices {
//   private bookingModel;
//   private packageModel;
//   constructor() {
//     super();
//     this.bookingModel = this.Model.umrahPackageBookinModel();
//     this.packageModel = this.Model.tourPackageModel();
//   }
//   public async getAllFixedPackageRequest(req: Request) {
//     const { skip, limit } = req.query as unknown as {
//       skip: number;
//       limit: number;
//     };
//     const offset = skip * limit;
//     const packageRequest =
//       await this.bookingModel.getAllFixedPackageBookingRequest(offset, limit);
//     if (!packageRequest)
//       return {
//         success: false,
//         code: this.StatusCode.HTTP_NOT_FOUND,
//         message: this.ResMsg.HTTP_NOT_FOUND,
//       };
//     return {
//       success: true,
//       code: this.StatusCode.HTTP_OK,
//       message: this.ResMsg.HTTP_OK,
//       data: packageRequest,
//     };
//   }
//   public async getAllCustomizePackageRequest() {
//     const packageRequest =
//       await this.bookingModel.getAllCustomizePackageBookingRequest();
//     if (!packageRequest)
//       return {
//         success: false,
//         code: this.StatusCode.HTTP_NOT_FOUND,
//         message: this.ResMsg.HTTP_NOT_FOUND,
//       };
//     return {
//       success: true,
//       code: this.StatusCode.HTTP_OK,
//       message: this.ResMsg.HTTP_OK,
//       data: packageRequest,
//     };
//   }
// }
