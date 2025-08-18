import { HumanMessage } from '@langchain/core/messages';
import { Request } from 'express';
import fs from 'fs';
import { z } from 'zod';
import AbstractServices from "../../../abstract/abstract.service";
import { chatGoogleGenerativeAI } from "../../../utils/lib/aiModel";

export class PublicAIService extends AbstractServices {

    public async getPassportDetails(req: Request) {
        const files = req.upFileBase64 as Record<string, string | string[]>;
        const commonModel = this.Model.commonModel();

        // Check if passport key exists
        if (!files['passport']) {
            return {
                success: false,
                code: this.StatusCode.HTTP_BAD_REQUEST,
                message: `Key 'passport' is missing in the request body. Please provide valid passport images.`,
            };
        }

        const passportSchema = z.object({
            first_name: z.string().describe('First name of the passport holder'),
            last_name: z.string().describe('Last name of the passport holder'),
            date_of_birth: z.string().describe('Date of birth (YYYY-MM-DD)'),
            gender: z.enum(['Male', 'Female', 'Other']).describe('Gender of the passport holder'),
            issuing_country: z.string().describe('Issuing Country of the passport holder in iso3 format'),
            nationality: z.string().describe('Nationality of the passport holder in iso3 format'),
            passport_expiry_date: z.string().describe('Passport expiry date (YYYY-MM-DD)'),
            passport_number: z.string().describe('Passport number'),
            reference: z.string().describe('Reference title: Mr (Male), Mrs (Married Female), Ms (Unmarried Female), Miss (Young Female), MSTR (Young Male)'),
            type: z.string().describe('Type of the passport holder: ADT (12+ years), C02-C11 (2-11 years), INF (<2 years)'),
            isInvalid: z.boolean().describe('Whether the passport is invalid'),
            isBlurry: z.boolean().describe('Whether the passport is blurry or unreadable or unclear'),
            isMultiple: z.boolean().describe('Whether there are multiple passports in the image'),
            message: z.string().describe('Any relevant messages about the passport processing'),
        });

        const structuredLlm = (chatGoogleGenerativeAI.withStructuredOutput as any)(passportSchema);

        // Cache for country lookups
        const countryCache = new Map<string, number>();
        const failedCountryLookups = new Set<string>();

        const getCountryId = async (iso3: string): Promise<number | null> => {
            if (!iso3 || iso3.length !== 3) {
                console.error(`Invalid ISO3 code: ${iso3}`);
                return null;
            }

            const upperIso3 = iso3.toUpperCase();

            if (countryCache.has(upperIso3)) {
                return countryCache.get(upperIso3)!;
            }

            if (failedCountryLookups.has(upperIso3)) {
                return null;
            }

            try {
                const country = await commonModel.getCountryByIso({ iso3: upperIso3 });
                if (!country || !country.id) {
                    console.error(`Country not found for ISO3: ${upperIso3}`);
                    failedCountryLookups.add(upperIso3);
                    return null;
                }

                countryCache.set(upperIso3, country.id);
                return country.id;
            } catch (error) {
                console.error(`Error fetching country ID for ISO3 ${upperIso3}:`, error);
                failedCountryLookups.add(upperIso3);
                return null;
            }
        };

        const processPassportImage = async (imageUrl: string) => {
            const humanMessage = new HumanMessage({
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

            return await structuredLlm.invoke([humanMessage]);
        };

        //Validate countries
        const validateCountries = async (nationalityIso: string, issuingCountryIso: string) => {
            const [nationalityId, issuingCountryId] = await Promise.all([
                getCountryId(nationalityIso),
                getCountryId(issuingCountryIso)
            ]);

            if (!nationalityId || !issuingCountryId) {
                console.error(`Country validation failed for: Nationality=${nationalityIso}, Issuing=${issuingCountryIso}`);
                return null;
            }

            return { nationalityId, issuingCountryId };
        };

        // Process all images first, then batch country lookups
        const processResults = async (results: any[]) => {
            const validResults = [];
            const errorMessages = [];

            for (const result of results) {
                if (result.isInvalid || result.isBlurry) {
                    errorMessages.push(result.message || 'Passport image is invalid or blurry');
                    continue;
                }

                const countries = await validateCountries(result.nationality, result.issuing_country);
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
        };

        // Handle single image
        if (typeof files['passport'] === 'string') {
            try {
                const result = await processPassportImage(files['passport']);

                if (result.isInvalid || result.isBlurry) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: result.message || 'Passport image is invalid or blurry'
                    };
                }

                const { validResults, errorMessages } = await processResults([result]);

                if (validResults.length === 0) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: errorMessages[0] || 'Invalid passport data'
                    };
                }


                const countries = await validateCountries(result.nationality, result.issuing_country);

                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: 'Passport processed successfully',
                    data: [{
                        first_name: result.first_name,
                        last_name: result.last_name,
                        date_of_birth: result.date_of_birth,
                        gender: result.gender,
                        issuing_country: countries?.issuingCountryId,
                        nationality: countries?.nationalityId,
                        passport_expiry_date: result.passport_expiry_date,
                        passport_number: result.passport_number,
                        reference: result.reference,
                        type: result.type
                    }]
                };
            } catch (error) {
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
                const processingResults = await Promise.all(
                    files['passport'].map(image =>
                        processPassportImage(image).catch(error => ({
                            isInvalid: true,
                            message: `Error processing image: ${error instanceof Error ? error.message : String(error)}`
                        }))
                    )
                );

                // Then handle country lookups
                const { validResults, errorMessages } = await processResults(processingResults);

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
            } catch (error) {
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
    }
}