import AbstractController from "../../../abstract/abstract.controller";
// import { B2CTourPackageBookingService } from "../services/btocTourPackageBooking.service";
import {Request, Response} from 'express'

// export class B2CTourPackageBookingController extends AbstractController{
//     // private service = new B2CTourPackageBookingService()
//     constructor(){
//         super()
        
//     }

//     public getAllFixedPackageRequest = this.asyncWrapper.wrap(null,
//         async(req:Request,res:Response)=>{
//             const {code, ...data} = await this.service.getAllFixedPackageRequest()
//             res.status(code).json(data)
//         }
//     )

//     public getAllCustomizePackageRequest = this.asyncWrapper.wrap(null,
//         async(req:Request,res:Response)=>{
//         const {code, ...data} = await this.service.getAllCustomizePackageRequest()
//         res.status(code).json(data)
//         }
//     )

// }