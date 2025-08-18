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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminBannerController = void 0;
const abstract_controller_1 = __importDefault(require("../../../abstract/abstract.controller"));
const admin_banner_service_1 = require("../services/admin.banner.service");
class AdminBannerController extends abstract_controller_1.default {
    constructor() {
        super();
        this.bannerService = new admin_banner_service_1.AdminBannerServie();
        //Upload banner Image
        this.uploadBanner = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.bannerService.uploadBannerImage(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(Number(code)).json(data);
        }));
        //Get banner Image
        this.getBannerImage = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.bannerService.getBannerImage(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(Number(code)).json(data);
        }));
        // Update Image
        this.updateImageStatus = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const ID = Number(id);
            const _a = yield this.bannerService.updateImageStatus(req, ID), { code } = _a, data = __rest(_a, ["code"]);
            res.status(Number(code)).json(data);
        }));
    }
}
exports.AdminBannerController = AdminBannerController;
