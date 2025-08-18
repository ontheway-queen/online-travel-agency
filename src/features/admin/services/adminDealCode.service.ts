import AbstractServices from "../../../abstract/abstract.service";
import { Request } from "express";
export class AdminDealCodeService extends AbstractServices {

    public async create(req: Request) {
        return await this.db.transaction(async (trx) => {
            const { deal_code, api } = req.body;
            const { id: user_id } = req.admin;
            const model = this.Model.DealCodeModel(trx);
            const checkDealCode = await model.getAll({ deal_code, api });
            if (checkDealCode.data.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_CONFLICT,
                    message: "This deal code already exists for this API"
                }
            }

            const res = await model.create({
                deal_code,
                api,
                created_by: user_id
            });

            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                message: "Deal code has been created",
                data: {
                    id: res[0]?.id
                }
            }
        })
    }

    public async getAll(req: Request) {
        const query = req.query;
        const model = this.Model.DealCodeModel();
        const data = await model.getAll(query, true);
        return {
            success: true,
            code: this.StatusCode.HTTP_OK,
            data: data.data,
            total: data.total
        }
    }

    public async update(req: Request) {
        const model = this.Model.DealCodeModel();
        const { id } = req.params;
        const body = req.body;
        const getDealCode = await model.getSingle(Number(id));
        if (!getDealCode.length) {
            return {
                success: false,
                code: this.StatusCode.HTTP_NOT_FOUND,
                message: this.ResMsg.HTTP_NOT_FOUND
            }
        }
        if (body.deal_code) {
            const checkDealCode = await model.getAll({ deal_code: body.deal_code, api: getDealCode[0].api });
            if (checkDealCode.data.length && checkDealCode.data[0].id != id) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_CONFLICT,
                    message: "This deal code already exists for this API"
                }
            }
        }
        await model.update(body, Number(id));
        return {
            success: true,
            code: this.StatusCode.HTTP_OK,
            message: "Successfully updated"
        }
    }

    public async delete(req: Request) {
        const model = this.Model.DealCodeModel();
        const { id } = req.params;
        const getDealCode = await model.getSingle(Number(id));
        if (!getDealCode.length) {
            return {
                success: false,
                code: this.StatusCode.HTTP_NOT_FOUND,
                message: this.ResMsg.HTTP_NOT_FOUND
            }
        }
        await model.delete(Number(id));
        return {
            success: true,
            code: this.StatusCode.HTTP_OK,
            message: "Deal code has been deleted"
        }
    }
}