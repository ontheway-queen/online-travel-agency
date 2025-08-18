"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const publicCommon_validator_1 = __importDefault(require("../features/public/utils/validators/publicCommon.validator"));
const fileFolders_1 = __importDefault(require("../utils/miscellaneous/fileFolders"));
const uploader_1 = __importDefault(require("../middleware/uploader/uploader"));
class AbstractRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.commonValidator = new publicCommon_validator_1.default();
        this.uploader = new uploader_1.default();
        this.fileFolders = fileFolders_1.default;
    }
}
exports.default = AbstractRouter;
