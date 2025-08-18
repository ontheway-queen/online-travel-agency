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
const auth_user_service_1 = __importDefault(require("../services/auth.user.service"));
class UserAuthController extends abstract_controller_1.default {
    constructor() {
        super();
        this.UserAuthService = new auth_user_service_1.default();
        //register
        this.registration = this.asyncWrapper.wrap({ bodySchema: this.commonValidator.registerValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.UserAuthService.registrationService(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //register
        this.verifyRegistrationRequest = this.asyncWrapper.wrap(null, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { email, otp, payload } = req.body;
            if (!email || !otp || !payload) {
                res.status(this.StatusCode.HTTP_UNPROCESSABLE_ENTITY).json({ message: "Give all the values" });
            }
            const _a = yield this.UserAuthService.verifyRegistrationRequest(email, otp, payload), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //register
        this.loginWithGoogle = this.asyncWrapper.wrap({ bodySchema: this.commonValidator.loginWithGoogleValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.UserAuthService.loginWithGoogle(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        //register
        this.loginWithFB = this.asyncWrapper.wrap({ bodySchema: this.commonValidator.loginWithFacebookValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.UserAuthService.loginWithFB(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        // login
        this.login = this.asyncWrapper.wrap({ bodySchema: this.commonValidator.loginValidator }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.UserAuthService.loginService(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
        // forget pass
        this.forgetPassword = this.asyncWrapper.wrap({ bodySchema: this.commonValidator.commonForgetPassInputValidation }, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const _a = yield this.UserAuthService.forgetPassword(req), { code } = _a, data = __rest(_a, ["code"]);
            res.status(code).json(data);
        }));
    }
}
exports.default = UserAuthController;
