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
exports.AdminAnnouncementController = void 0;
const abstract_controller_1 = __importDefault(require("../../../abstract/abstract.controller"));
const admin_announcement_service_1 = require("../services/admin.announcement.service");
const admin_announcement_validator_1 = require("../utils/validators/admin.announcement.validator");
class AdminAnnouncementController extends abstract_controller_1.default {
    constructor() {
        super(...arguments);
        this.service = new admin_announcement_service_1.AdminAnnouncementService();
        this.validator = new admin_announcement_validator_1.AdminAnnouncementValidator();
        // get all announcement
        this.getAllAnnouncement = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getAllAnnouncement(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        // create announcement
        this.createAnnouncement = this.asyncWrapper.wrap({
            bodySchema: this.validator.createAnnouncementSchema,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.createAnnouncement(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        // get single announcement
        this.getSingleAnnouncement = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.getSingleAnnoucement(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //update announcement
        this.updateAnnouncement = this.asyncWrapper.wrap({
            bodySchema: this.validator.updateAnnouncementSchema,
            paramSchema: this.commonValidator.singleParamValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.updateAnnouncement(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //delete announcement
        this.deleteAnnouncement = this.asyncWrapper.wrap({
            paramSchema: this.commonValidator.singleParamValidator,
        }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.service.deleteAnnouncement(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
    }
}
exports.AdminAnnouncementController = AdminAnnouncementController;
