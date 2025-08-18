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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoapJsonConverter = void 0;
const { parseStringPromise } = require('xml2js');
class SoapJsonConverter {
    xmlToJson(xmlString) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("calling");
            try {
                const result = yield parseStringPromise(xmlString, {
                    explicitArray: false,
                    mergeAttrs: false,
                    trim: true,
                    normalizeTags: false,
                    explicitRoot: false,
                    valueProcessors: [
                        (value, name) => {
                            if (/^-?\d+(\.\d+)?$/.test(value))
                                return parseFloat(value);
                            if (value === 'true')
                                return true;
                            if (value === 'false')
                                return false;
                            if (name === 'i:nil' && value === 'true')
                                return null;
                            return value;
                        },
                    ],
                });
                return result;
            }
            catch (error) {
                console.error('Error parsing XML:', error.message);
                return false;
            }
        });
    }
}
exports.SoapJsonConverter = SoapJsonConverter;
