import AbstractServices from "../../../abstract/abstract.service";
import { Request } from "express";
export class AdminCurrencyService extends AbstractServices {

    public async getApiList(req: Request) {
        return await this.db.transaction(async (trx) => {
            const model = this.Model.CurrencyModel(trx);
            const res = await model.getApiList(req.query.type as 'FLIGHT' | 'HOTEL');
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: res
            }
        });
    }

    public async createApiWiseCurrency(req: Request) {
        return await this.db.transaction(async (trx) => {
            const {id: userId} = req.admin;
            const model = this.Model.CurrencyModel(trx);
            const body = req.body;
            const check_entry = await model.getApiWise({ filter: body.api_id });
            if (check_entry.length > 0) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: "Currency already exists for this api"
                }
            }
            const res = await model.createApiWise({...body, created_by: userId});
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                message: "Api wise currency has been created",
                data: {
                    id: res?.[0]?.id
                }
            }
        });
    }

    public async getApiWiseCurrency(req: Request) {
        return await this.db.transaction(async (trx) => {
            const model = this.Model.CurrencyModel(trx);
            const query = req.query;
            const res = await model.getApiWise(query as { filter?: number });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: res
            }
        });
    }

    public async updateApiWiseCurrency(req: Request) {
        return await this.db.transaction(async (trx) => {
            const model = this.Model.CurrencyModel(trx);
            const body = req.body;
            const id = parseInt(req.params.id);
            const res = await model.updateApiWise(body, id);
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                message: "Api wise currency has been updated",
            }
        });
    }

    public async deleteApiWiseCurrency(req: Request) {
        return await this.db.transaction(async (trx) => {
            const model = this.Model.CurrencyModel(trx);
            const id = parseInt(req.params.id);
            await model.deleteApiWise(id);
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                message: "Api wise currency has been deleted",
            }
        });
    }
}