import AbstractController from "../../../abstract/abstract.controller";
import { Request, Response } from 'express';
import { AdminB2BReissueRequestService } from "../services/adminB2BReissueRequest.service";
import { AdminB2BReissueRequestValidator } from "../utils/validators/adminB2BReissueRequest.validator";

export class AdminB2BReissueRequestController extends AbstractController {
    private service = new AdminB2BReissueRequestService();
    private validator = new AdminB2BReissueRequestValidator();
    public getReissueList = this.asyncWrapper.wrap(
        null,
        async (req: Request, res: Response) => {
            const { code, ...rest } = await this.service.getReissueList(
                req
            );
            res.status(code).json(rest);
        }
    );

    public getSingleReissue = this.asyncWrapper.wrap(
        { paramSchema: this.commonValidator.singleParamValidator },
        async (req: Request, res: Response) => {
            const { code, ...rest } = await this.service.getSingleReissue(
                req
            );
            res.status(code).json(rest);
        }
    );


    public updateReissueRequest = this.asyncWrapper.wrap(
        {
            paramSchema: this.commonValidator.singleParamValidator,
            bodySchema: this.validator.UpdateReissueRequest
        },
        async (req: Request, res: Response) => {
            const { code, ...rest } = await this.service.updateReissueRequest(
                req
            );
            res.status(code).json(rest);
        }
    );
}