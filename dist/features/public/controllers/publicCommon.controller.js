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
const abstract_controller_1 = __importDefault(require("../../../abstract/abstract.controller"));
const publicCommon_service_1 = __importDefault(require("../services/publicCommon.service"));
class PublicCommonController extends abstract_controller_1.default {
    constructor() {
        super();
        this.commonService = new publicCommon_service_1.default();
        //get all country
        this.getAllCountry = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.commonService.getAllCountry(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //get all city
        this.getAllCity = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.commonService.getAllCity(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //get all airport
        this.getAllAirport = this.asyncWrapper.wrap({ bodySchema: this.commonValidator.airportFilterSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.commonService.getAllAirport(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //airlines list
        this.getAllAirlines = this.asyncWrapper.wrap({ querySchema: this.commonValidator.airlineFilterSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.commonService.getAllAirlines(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //get all visa country list
        this.getAllVisaCountryList = this.asyncWrapper.wrap({ querySchema: this.commonValidator.visaListSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.commonService.getAllVisaCountryList(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //visa list
        this.getAllVisaList = this.asyncWrapper.wrap({ querySchema: this.commonValidator.visaListSchema }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.commonService.getAllVisaList(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //get all visa Type
        this.getAllVisaType = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.commonService.getAllVisaType(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //single visa
        this.getSingleVisa = this.asyncWrapper.wrap({ paramSchema: this.commonValidator.singleParamValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.commonService.getSingleVisa(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //get article list
        this.getArticleList = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.commonService.getArticleList(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //get single article
        this.getSingleArticle = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.commonService.getSingleArticle(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //get all offer list
        this.getAllOfferList = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.commonService.getAllOffer(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //get single article
        this.getSingleOffer = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.commonService.getSingleOffer(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
            // res.send("working");
        }));
        this.getAciveOnlyBannerImage = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.commonService.getActiveOnlyBannerImage(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(Number(code)).json(data);
        }));
        // //Customize Tour Package Booking Controller
        // public customizeTourPackageBooking = this.asyncWrapper.wrap(
        //   {
        //     bodySchema: this.tourPackageValidators.customizePackageBookingBodySchema,
        //     paramSchema: this.tourPackageValidators.PackageBookingParamSchema,
        //   },
        //   async (req: Request, res: Response) => {
        //     const { code, ...data } =
        //       await this.commonService.customizeTourPackageBooking(req);
        //     res.status(code).json(data);
        //   }
        // );
        // //Customize Umrah Package Booking Controller
        // public customizeUmrahPackageBooking = this.asyncWrapper.wrap(
        //   {
        //     bodySchema: this.umrahPackageValidators.customizePackageBookingBodySchema,
        //     paramSchema: this.umrahPackageValidators.PackageBookingParamSchema,
        //   },
        //   async (req: Request, res: Response) => {
        //     const { code, ...data } =
        //       await this.commonService.customizeUmrahPackageBooking(req);
        //     res.status(code).json(data);
        //   }
        // );
        //get b2c data for corporate travel
        this.getB2CDataForCorporatePackagePage = this.asyncWrapper.wrap(null, (_, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.commonService.getB2CDataForCorporatePackagePage(), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //get detail description
        this.getDetailDescription = this.asyncWrapper.wrap(null, (_, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.commonService.getDetailDescription(), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //get all announcement
        this.getAllAnnouncementList = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.commonService.getAllAnnouncementList(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        this.uploadLogo = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.commonService.uploadLogo(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //test
        this.test = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.commonService.test();
            res.status(200).json(data);
        }));
    }
}
exports.default = PublicCommonController;
