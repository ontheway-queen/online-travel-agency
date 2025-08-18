"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAnnouncementRouter = void 0;
const abstract_router_1 = __importDefault(require("../../../abstract/abstract.router"));
const admin_announcement_controller_1 = require("../controllers/admin.announcement.controller");
class AdminAnnouncementRouter extends abstract_router_1.default {
    constructor() {
        super();
        this.announcementController = new admin_announcement_controller_1.AdminAnnouncementController();
        this.callRouter();
    }
    callRouter() {
        this.router
            .route("/")
            //get all
            .get(this.announcementController.getAllAnnouncement)
            //create announcement
            .post(this.announcementController.createAnnouncement);
        //get single
        this.router
            .route("/:id")
            //get single
            .get(this.announcementController.getSingleAnnouncement)
            //update
            .patch(this.announcementController.updateAnnouncement)
            //delete
            .delete(this.announcementController.deleteAnnouncement);
    }
}
exports.AdminAnnouncementRouter = AdminAnnouncementRouter;
