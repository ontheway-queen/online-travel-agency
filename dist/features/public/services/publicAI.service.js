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
exports.PublicAIService = void 0;
const messages_1 = require("@langchain/core/messages");
const zod_1 = require("zod");
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const aiModel_1 = require("../../../utils/lib/aiModel");
class PublicAIService extends abstract_service_1.default {
    getPassportDetails(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const files = req.upFileBase64;
            const commonModel = this.Model.commonModel();
            // Check if passport key exists
            if (!files['passport']) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: `Key 'passport' is missing in the request body. Please provide valid passport images.`,
                };
            }
            const passportSchema = zod_1.z.object({
                first_name: zod_1.z.string().describe('First name of the passport holder'),
                last_name: zod_1.z.string().describe('Last name of the passport holder'),
                date_of_birth: zod_1.z.string().describe('Date of birth (YYYY-MM-DD)'),
                gender: zod_1.z.enum(['Male', 'Female', 'Other']).describe('Gender of the passport holder'),
                issuing_country: zod_1.z.string().describe('Issuing Country of the passport holder in iso3 format'),
                nationality: zod_1.z.string().describe('Nationality of the passport holder in iso3 format'),
                passport_expiry_date: zod_1.z.string().describe('Passport expiry date (YYYY-MM-DD)'),
                passport_number: zod_1.z.string().describe('Passport number'),
                reference: zod_1.z.string().describe('Reference title: Mr (Male), Mrs (Married Female), Ms (Unmarried Female), Miss (Young Female), MSTR (Young Male)'),
                type: zod_1.z.string().describe('Type of the passport holder: ADT (12+ years), C02-C11 (2-11 years), INF (<2 years)'),
                isInvalid: zod_1.z.boolean().describe('Whether the passport is invalid'),
                isBlurry: zod_1.z.boolean().describe('Whether the passport is blurry or unreadable or unclear'),
                isMultiple: zod_1.z.boolean().describe('Whether there are multiple passports in the image'),
                message: zod_1.z.string().describe('Any relevant messages about the passport processing'),
            });
            const structuredLlm = aiModel_1.chatGoogleGenerativeAI.withStructuredOutput(passportSchema);
            // Cache for country lookups
            const countryCache = new Map();
            const failedCountryLookups = new Set();
            const getCountryId = (iso3) => __awaiter(this, void 0, void 0, function* () {
                if (!iso3 || iso3.length !== 3) {
                    console.error(`Invalid ISO3 code: ${iso3}`);
                    return null;
                }
                const upperIso3 = iso3.toUpperCase();
                if (countryCache.has(upperIso3)) {
                    return countryCache.get(upperIso3);
                }
                if (failedCountryLookups.has(upperIso3)) {
                    return null;
                }
                try {
                    const country = yield commonModel.getCountryByIso({ iso3: upperIso3 });
                    if (!country || !country.id) {
                        console.error(`Country not found for ISO3: ${upperIso3}`);
                        failedCountryLookups.add(upperIso3);
                        return null;
                    }
                    countryCache.set(upperIso3, country.id);
                    return country.id;
                }
                catch (error) {
                    console.error(`Error fetching country ID for ISO3 ${upperIso3}:`, error);
                    failedCountryLookups.add(upperIso3);
                    return null;
                }
            });
            const processPassportImage = (imageUrl) => __awaiter(this, void 0, void 0, function* () {
                const humanMessage = new messages_1.HumanMessage({
                    content: [
                        {
                            type: 'text',
                            text: `You are an advanced OCR system specialized in passport processing. Carefully analyze the passport image and:

1. PERSON TYPE:
   - If holder is 12+ years old: "ADT"
   - If holder is 2-11 years old: "C0X" where X is age (e.g., C05 for 5 years old)
   - If holder is under 2 years: "INF"

2. REFERENCE TITLE:
   - Male adults: "Mr"
   - Married females: "Mrs"
   - Unmarried females: "Ms"
   - Young females: "Miss"
   - Young males: "MSTR"

3. GENDER:
   - "Male" if male
   - "Female" if female
   - "Other" if not clearly identifiable

4. Extract all other fields exactly as shown on passport:
   - First name, Last name (exactly as printed)
   - Passport number (exact characters)
   - Nationality & Issuing Country (in ISO3 format)
   - Dates in YYYY-MM-DD format

5. Validation:
   - Set isInvalid=true if: not a passport, missing critical fields, or unreadable
   - Set isBlurry=true if image quality affects readability
   - Set isMultiple=true if multiple passports in image

Return null for any unreadable fields. Include specific error messages when applicable.`
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: imageUrl,
                            },
                        },
                    ],
                });
                return yield structuredLlm.invoke([humanMessage]);
            });
            //Validate countries
            const validateCountries = (nationalityIso, issuingCountryIso) => __awaiter(this, void 0, void 0, function* () {
                const [nationalityId, issuingCountryId] = yield Promise.all([
                    getCountryId(nationalityIso),
                    getCountryId(issuingCountryIso)
                ]);
                if (!nationalityId || !issuingCountryId) {
                    console.error(`Country validation failed for: Nationality=${nationalityIso}, Issuing=${issuingCountryIso}`);
                    return null;
                }
                return { nationalityId, issuingCountryId };
            });
            // Process all images first, then batch country lookups
            const processResults = (results) => __awaiter(this, void 0, void 0, function* () {
                const validResults = [];
                const errorMessages = [];
                for (const result of results) {
                    if (result.isInvalid || result.isBlurry) {
                        errorMessages.push(result.message || 'Passport image is invalid or blurry');
                        continue;
                    }
                    const countries = yield validateCountries(result.nationality, result.issuing_country);
                    if (!countries) {
                        errorMessages.push(`Could not validate country information for passport ${result.passport_number}`);
                        continue;
                    }
                    validResults.push({
                        first_name: result.first_name,
                        last_name: result.last_name,
                        date_of_birth: result.date_of_birth,
                        gender: result.gender,
                        issuing_country: countries.issuingCountryId,
                        nationality: countries.nationalityId,
                        passport_expiry_date: result.passport_expiry_date,
                        passport_number: result.passport_number,
                        reference: result.reference,
                        type: result.type
                    });
                }
                return { validResults, errorMessages };
            });
            // Handle single image
            if (typeof files['passport'] === 'string') {
                try {
                    const result = yield processPassportImage(files['passport']);
                    if (result.isInvalid || result.isBlurry) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: result.message || 'Passport image is invalid or blurry'
                        };
                    }
                    const { validResults, errorMessages } = yield processResults([result]);
                    if (validResults.length === 0) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: errorMessages[0] || 'Invalid passport data'
                        };
                    }
                    const countries = yield validateCountries(result.nationality, result.issuing_country);
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        message: 'Passport processed successfully',
                        data: [{
                                first_name: result.first_name,
                                last_name: result.last_name,
                                date_of_birth: result.date_of_birth,
                                gender: result.gender,
                                issuing_country: countries === null || countries === void 0 ? void 0 : countries.issuingCountryId,
                                nationality: countries === null || countries === void 0 ? void 0 : countries.nationalityId,
                                passport_expiry_date: result.passport_expiry_date,
                                passport_number: result.passport_number,
                                reference: result.reference,
                                type: result.type
                            }]
                    };
                }
                catch (error) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
                        message: `Error processing passport image: ${error instanceof Error ? error.message : String(error)}`
                    };
                }
            }
            // Handle multiple images
            if (Array.isArray(files['passport'])) {
                try {
                    // Process all images first
                    const processingResults = yield Promise.all(files['passport'].map(image => processPassportImage(image).catch(error => ({
                        isInvalid: true,
                        message: `Error processing image: ${error instanceof Error ? error.message : String(error)}`
                    }))));
                    // Then handle country lookups
                    const { validResults, errorMessages } = yield processResults(processingResults);
                    if (validResults.length === 0) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: errorMessages.join('; ') || 'All passport images were invalid or blurry'
                        };
                    }
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        message: errorMessages.length > 0
                            ? `Processed ${validResults.length} passport(s) successfully, with ${errorMessages.length} error(s): ${errorMessages.join('; ')}`
                            : 'All passports processed successfully',
                        data: validResults
                    };
                }
                catch (error) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
                        message: `Error processing passports: ${error instanceof Error ? error.message : String(error)}`
                    };
                }
            }
            // Handle case where passport is neither string nor array
            return {
                success: false,
                code: this.StatusCode.HTTP_BAD_REQUEST,
                message: `Invalid format for passport images. Expected string or array of strings.`,
            };
        });
    }
}
exports.PublicAIService = PublicAIService;
