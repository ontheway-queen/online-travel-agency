import AbstractController from "../../../abstract/abstract.controller";
import { B2CUmrahPackageService } from "../services/umrahPackage.service";
import {Request,Response} from 'express'


export class B2CUmrahPackageController extends AbstractController {
    private service = new B2CUmrahPackageService();

    public getAllUmrahPackageForB2C = this.asyncWrapper.wrap(null,
        async(req:Request,res:Response)=>{
            const {code , ...data} = await this.service.getAllUmrahPackageForB2C(req)
            res.status(code).json(data)
        }
    )

    public getSingleUmrahPackageForB2C = this.asyncWrapper.wrap(null,
        async(req:Request,res:Response)=>{
            const {code , ...data} = await this.service.getSingleUmrahPackageForB2C(req)
            res.status(code).json(data)
        }
    )

    public getCityName = this.asyncWrapper.wrap(null,
        async(req:Request,res:Response)=>{
            const {code, ...data } = await this.service.getCityName(req)
            res.status(code).json(data)
        }
    )

}