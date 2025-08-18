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
exports.AdminAnnouncementService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
class AdminAnnouncementService extends abstract_service_1.default {
    constructor() {
        super();
        this.model = this.Model.announcementModel();
    }
    //get all announcement
    getAllAnnouncement(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { isActive } = req.query;
            const announcement = yield this.model.getAllAnnouncementBar({ isActive });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: announcement || [],
            };
        });
    }
    //get single announcement
    createAnnouncement(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = req.body;
            yield this.model.createAnnouncementBar(payload);
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                message: this.ResMsg.HTTP_SUCCESSFUL,
            };
        });
    }
    //get single announcement
    getSingleAnnoucement(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const announcement = yield this.model.getSingeAnnouncementBar(Number(id));
            if (!announcement) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: 'No announcement found',
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: announcement,
            };
        });
    }
    //update announcement
    updateAnnouncement(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const payload = req.body;
            const announcement = yield this.model.getSingeAnnouncementBar(Number(id));
            // console.log(announcement)
            if (!announcement) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: 'No announcement found',
                };
            }
            yield this.model.updateAnnouncementBar(payload, Number(id));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: 'Announcement updated successfully',
            };
        });
    }
    //delete announcement
    deleteAnnouncement(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const announcement = yield this.model.getSingeAnnouncementBar(Number(id));
            if (!announcement) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: 'No announcement found to delete',
                };
            }
            yield this.model.deleteAnnouncementBar(Number(id));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: 'Announcement deleted successfully',
            };
        });
    }
}
exports.AdminAnnouncementService = AdminAnnouncementService;
