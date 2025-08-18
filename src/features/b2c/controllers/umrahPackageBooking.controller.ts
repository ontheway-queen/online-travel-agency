import {Request,Response} from 'express'
import AbstractController from '../../../abstract/abstract.controller';
import { UmrahPackageBookingService } from '../services/umrahPackageBooking.service';
import { BookingUmrahPackageValidator } from '../utils/validators/bookingUmrahPackage.validator';



export class UmrahPackageBookingControllerForBtoc extends AbstractController{
    private service = new UmrahPackageBookingService()
    private validators = new BookingUmrahPackageValidator()


    //Insert Umrah Package Booking Controller
    public umrahPackageBookingService = this.asyncWrapper.wrap({
      bodySchema:this.validators.umrahPackageBookingBodySchema,
    },
        async(req:Request,res:Response)=>{
            
            const {code, ...data} = await this.service.umrahPackageBooking(req)
            res.status(code).json(data)
        }
    )

    //Get My History Umrah Package Booking Controller
    public getMyBookingHistory = this.asyncWrapper.wrap(
        null,
          async(req:Request,res:Response)=>{
              
              const {code, ...data} = await this.service.getMyBookingHistory(req)
              res.status(code).json(data)
          }
      )


      //Get Single Booking
      public getSingleBooking = this.asyncWrapper.wrap(
        null,
          async(req:Request,res:Response)=>{
              
              const {code, ...data} = await this.service.getSingleBooking(req)
              res.status(code).json(data)
          }
      )
   
}