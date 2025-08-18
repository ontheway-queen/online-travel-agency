"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
class SpecialOfferBToCService extends abstract_service_1.default {
    // get all speacial offers
    getSpecialOffers(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.specialOfferModel();
            const { key, limit, skip, type, status } = req.query;
            const { data, total } = yield model.getSpecialOffers({
                key,
                limit,
                skip,
                type,
                status: "ACTIVE",
                panel: ["B2B", "ALL"],
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data,
                total,
            };
        });
    }
    // get single speacial offer
    getSingleSpecialOffer(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const model = this.Model.specialOfferModel();
            const single_offer = yield model.getSingleSpecialOffer({ id: Number(id), panel: ["B2B", "ALL"] });
            if (!single_offer.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: single_offer[0],
            };
        });
    }
}
exports.default = SpecialOfferBToCService;
