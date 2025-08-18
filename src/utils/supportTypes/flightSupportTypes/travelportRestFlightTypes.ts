////---------FLIGHT SEARCH BODY START------------////
export interface ITravelportFlightSearchBody {
    CatalogProductOfferingsQueryRequest: ICatalogProductOfferingsQueryRequest
}
interface ICatalogProductOfferingsQueryRequest {
    CatalogProductOfferingsRequest: ICatalogProductOfferingsRequest;
}

interface ICatalogProductOfferingsRequest {
    "@type": "CatalogProductOfferingsRequestAir";
    maxNumberOfUpsellsToReturn?: 1 | 2 | 3 | 4;
    offersPerPage?: number;
    contentSourceList: ("NDC" | "GDS")[];
    PassengerCriteria: IPassengerCriteria[];
    SearchCriteriaFlight: ISearchCriteriaFlight[];
    SearchModifiersAir?: ISearchModifiersAir;
}

export interface IPassengerCriteria {
    number: number;
    passengerTypeCode: "ADT" | "CHD" | "CNN" | "INF" | "INS" | "UNN";
}

export interface ISearchCriteriaFlight {
    departureDate: string;
    From: ILocation;
    To: ILocation;
}

interface ILocation {
    value: string;
}

interface ISearchModifiersAir {
    "@type"?: "SearchModifiersAir",
    CarrierPreference?: ICarrierPreference[];
    CabinPreference?: ICabinPreference[];
}

interface ICarrierPreference {
    preferenceType: "Permitted" | "Prohibited";
    carriers: string[];
}

interface ICabinPreference {
    "@type": "CabinPreference";
    preferenceType: "Permitted";
    cabins: string[];
}
////---------FLIGHT SEARCH BODY END------------////



////-------FLIGHT SEARCH RESPONSE START---------////

export interface ITravelportFlightSearchResponse {
    CatalogProductOfferingsResponse: ICatalogProductOfferingsResponse;
}
export interface ICatalogProductOfferingsResponse {
    "@type": "CatalogProductOfferingsResponse";
    transactionId: string;
    CatalogProductOfferings: IFlightSearchCatalogProductOfferings;
    Result: IFlightSearchResultRef;
    ReferenceList: IFlightSearchReferenceList[];
}

interface IFlightSearchCatalogProductOfferings {
    "@type": "CatalogProductOfferings";
    Identifier: IFlightSearchIdentifier;
    CatalogProductOffering: IFlightSearchCatalogProductOfferingDetails[];
}

interface IFlightSearchIdentifier {
    value: string;
}

export interface IFlightSearchCatalogProductOfferingDetails {
    "@type": "CatalogProductOffering";
    sequence: number;
    id: string;
    Departure: string;
    Arrival: string;
    Brand: IFlightSearchBrandRef[];
    ProductBrandOptions: IFlightSearchProductBrandOptions[];
}

interface IFlightSearchBrandRef {
    "@type": "BrandID";
    BrandRef: string;
}

export interface IFlightSearchProductBrandOptions {
    "@type": "ProductBrandOptions",
    flightRefs: string[];
    ProductBrandOffering: IFlightSearchProductBrandOffering[];
}

interface IFlightSearchProductBrandOffering {
    "@type": "ProductBrandOffering";
    Price: IFlightSearchBrandOfferingPrice;
    Brand: IFlightSearchBrandRef;
    Product: IFlightSearchProductRef[];
    TermsAndConditions: IFlightSearchTermsAndConditionsRef;
    CombinabilityCode: string[];
    BestCombinablePrice: IFlightSearchBrandOfferingPrice;

}

interface IFlightSearchProductRef {
    "@type": "ProductID";
    productRef: string;
}

interface IFlightSearchTermsAndConditionsRef {
    "@type": "TermsAndConditionsID";
    termsAndConditionsRef: string;
}

interface IFlightSearchBrandOfferingPrice {
    "@type": "PriceDetail" | "BestCombinablePriceDetail";
    CurrencyCode: IFlightSearchCurrencyCode;
    Base: number;
    TotalTaxes: number;
    TotalFees: number;
    TotalPrice: number;
    PriceBreakdown: IFlightSearchPriceBreakdown[];
}

interface IFlightSearchCurrencyCode {
    decimalPlace: number;
    value: string;
}

interface IFlightSearchPriceBreakdown {
    "@type": "PriceBreakdownAir",
    quantity: number;
    requestedPassengerType: string;
    Amount: IFlightSearchAmount
}

interface IFlightSearchAmount {
    "@type": "Amount";
    CurrencyCode: IFlightSearchCurrencyCode;
    Base: number;
    Taxes: IFlightSearchTaxes;
    Fees: IFlightSearchFees;
    Total: number;
}

interface IFlightSearchTaxes {
    "@type": "TaxesDetail",
    TotalTaxes: number;
    Tax: IFlightSearchTaxRef[];
}

interface IFlightSearchTaxRef {
    taxCode: string;
    value: number;
}

interface IFlightSearchFees {
    "@type": "FeesDetail";
    TotalFees: number;
}

interface IFlightSearchResultRef {
    "@type": "Result";
}

interface IFlightSearchReferenceList {
    "@type": "ReferenceListFlight" | "ReferenceListProduct" | "ReferenceListTermsAndConditions" | "ReferenceListBrand";
    Flight?: IFlightDetail[];
    Product?: IProductAir[];
    TermsAndConditions?: IFlightSearchTermsAndConditionsAir[];
    Brand?: IFlightSearchBrandInfo[];
}

interface IFlightDetail {
    "@type": "FlightDetail";
    distance: number;
    duration: string;
    carrier: string;
    number: string;
    equipment: string;
    id: string;
    Departure: IDepartureDetail;
    Arrival: IArrivalDetail;
    AvailabilitySourceCode: string;
    operatingCarrier?: string;
    operatingCarrierName?: string;
    operatingCarrierNumber?: string;
}

interface IDepartureDetail {
    "@type": "DepartureDetail";
    terminal: string;
    location: string;
    date: string;
    time: string;
}

interface IArrivalDetail {
    "@type": "ArrivalDetail";
    terminal: string;
    location: string;
    date: string;
    time: string;
}

interface IProductAir {
    "@type": "ProductAir";
    totalDuration: string;
    id: string;
    Quantity: number;
    FlightSegment: IFlightSegment[];
    PassengerFlight: IPassengerFlight[];
}

interface IFlightSegment {
    "@type": "FlightSegment";
    sequence: number;
    connectionDuration?: string;
    boundFlightsInd?: boolean;
    Flight: IFlightIDRef;
}

interface IFlightIDRef {
    "@type": "FlightID";
    FlightRef: string;
}

interface IPassengerFlight {
    "@type": "PassengerFlight";
    passengerQuantity: number;
    passengerTypeCode: string;
    FlightProduct: IFlightProduct[];
}

interface IFlightProduct {
    "@type": "FlightProduct";
    segmentSequence: number[];
    classOfService: string;
    cabin: string;
    fareBasisCode: string;
    fareType: string;
    fareTypeCode: string;
    ticketDesignator?: string;
    Brand: IFlightSearchBrandRef;
}

interface IFlightSearchTermsAndConditionsAir {
    "@type": "TermsAndConditionsAir";
    secureFlightPassengerDataRequiredInd: boolean;
    id: string;
    BaggageAllowance: IBaggageAllowanceDetail[];
    ValidatingAirline: IValidatingAirline[];
    PaymentTimeLimit: string;
    Penalties: IPenalties[];
}

interface IBaggageAllowanceDetail {
    "@type": string;
    url?: string;
    passengerTypeCodes: string[];
    baggageType: string;
    validatingAirlineCode: string;
    ProductRef: string[];
    BaggageItem: IBaggageItem[];
    SegmentSequenceList: number[];
    Text?: string[];
}

interface IBaggageItem {
    "@type": string;
    quantity: number;
    BaggageFee?: IBaggageFee;
    Measurement?: IBaggageMeasurement[];
    Text?: string;
}

interface IBaggageFee {
    code: string;
    approximateInd: boolean;
    value: number;
}

interface IBaggageMeasurement {
    measurementType: string;
    unit: string;
    value: number;
}

interface IValidatingAirline {
    "@type": "ValidatingAirline";
    ValidatingAirline: string;
}

interface IPenalties {
    "@type": "Penalties";
    Change: IChangePermitted[];
    Cancel: ICancelPermitted[];
    PassengerTypeCodes: string[];
}

interface IChangePermitted {
    "@type": "ChangePermitted";
    penaltyTypes: string[];
    PenaltyAppliesTo: string;
    Penalty: IPenaltyAmount[];
}

interface ICancelPermitted {
    "@type": "CancelPermitted";
    penaltyTypes: string[];
    PenaltyAppliesTo: string;
    Penalty: IPenaltyAmount[];
}

interface IPenaltyAmount {
    "@type": "PenaltyAmount";
    Amount: IAmountDetail;
}

interface IAmountDetail {
    code: string;
    minorUnit: number;
    value: number;
}

interface IFlightSearchBrandInfo {
    "@type": "Brand";
    name: string;
    tier: number;
    shelfNumbers: any[];
    code: string;
    id: string;
    Identifier: IFlightSearchIdentifier;
    BrandAttribute: IBrandAttribute[];
}

interface IBrandAttribute {
    "@type": "BrandAttribute";
    classification: string;
    inclusion: string;
    groupCode: string;
    subGroupCode: string;
    subCode: string;
}
////-------FLIGHT SEARCH RESPONSE END---------////





//////------------FLIGHT REVALIDATE BODY START------------////////////
export interface IOfferQueryBuildFromCatalogProductOfferings {
    OfferQueryBuildFromCatalogProductOfferings: {
        BuildFromCatalogProductOfferingsRequest: IBuildFromCatalogProductOfferingsRequestAir;
    };
}

interface IBuildFromCatalogProductOfferingsRequestAir {
    "@type": "BuildFromCatalogProductOfferingsRequestAir";
    validateInventoryInd: boolean;
    CatalogProductOfferingsIdentifier: ICatalogProductOfferingsIdentifier;
    CatalogProductOfferingSelection: ICatalogProductOfferingSelection[];
}

interface ICatalogProductOfferingsIdentifier {
    Identifier: IIdentifier;
}

export interface ICatalogProductOfferingSelection {
    CatalogProductOfferingIdentifier: ICatalogProductOfferingIdentifier;
    ProductIdentifier: IProductIdentifier[];
}

interface ICatalogProductOfferingIdentifier {
    Identifier: IIdentifier;
}

interface IProductIdentifier {
    Identifier: IIdentifier;
}

interface IIdentifier {
    value: string;
}
//////------------FLIGHT REVALIDATE BODY END------------////////////






/////////-----------FLIGHT REVALIDATE RESPONSE START---------------///////////
export interface IOfferListResponse {
    OfferListResponse: {
        "@type": "OfferListResponse";
        transactionId: string;
        OfferID: IOffer[];
        Identifier: IIdentifier;
        ReferenceList: IReferenceList[];
    };
}

interface IOffer {
    "@type": "Offer";
    id: string;
    Product: IProductAirRevalidate[];
    Price: IPriceDetail;
    TermsAndConditionsFull: ITermsAndConditionsFullAir[];
}

interface IProductAirRevalidate {
    "@type": "ProductAir";
    totalDuration: string;
    id: string;
    FlightSegment: IFlightSegmentRevalidate[];
    PassengerFlight: IPassengerFlight[];
}

interface IFlightSegmentRevalidate {
    "@type": "FlightSegment";
    id: string;
    sequence: number;
    connectionDuration: string;
    boundFlightsInd: boolean;
    Flight: IFlightDetailsRevalidate;
}

interface IFlightDetailsRevalidate {
    "@type": "FlightDetail";
    distance: number;
    duration: string;
    carrier: string;
    number: string;
    operatingCarrier?: string;
    operatingCarrierName?: string;
    operatingCarrierNumber?: string;
    equipment: string;
    Departure: IDepartureDetail;
    Arrival: IArrivalDetail;
    AvailabilitySourceCode: string;
}

interface IPriceDetail {
    "@type": "PriceDetail";
    id: string;
    CurrencyCode: ICurrencyCode;
    Base: number;
    TotalTaxes: number;
    TotalFees: number;
    TotalPrice: number;
    PriceBreakdown: IPriceBreakdownAir[];
}

interface ICurrencyCode {
    decimalPlace: number;
    value: string;
}

interface IPriceBreakdownAir {
    "@type": "PriceBreakdownAir";
    quantity: number;
    requestedPassengerType: string;
    Amount: IAmount;
    FiledAmount: IFiledAmount;
    FareCalculation: string;
}

interface IAmount {
    "@type": "Amount";
    CurrencyCode: ICurrencyCode;
    Base: number;
    Taxes: ITaxesDetail;
    Fees: IFeesDetail;
    Total: number;
}

interface ITaxesDetail {
    "@type": string;
    TotalTaxes: number;
    Tax: ITax[];
}

interface ITax {
    taxCode: "TaxesDetail";
    value: number;
}

interface IFeesDetail {
    "@type": "FeesDetail";
    TotalFees: number;
}

interface IFiledAmount {
    currencyCode: string;
    decimalPlace: number;
    value: number;
}

interface ITermsAndConditionsFullAir {
    "@type": "TermsAndConditionsFullAir";
    secureFlightPassengerDataRequiredInd: boolean;
    ExpiryDate: string;
    BaggageAllowance: IBaggageAllowanceDetail[];
    Restriction: IRestriction[];
    ValidatingAirline: IValidatingAirline[];
    TicketingAgency: ITicketingAgency[];
    PaymentTimeLimit: string;
    FareGuaranteePolicy: IFareGuaranteePolicy[];
}

interface IBaggageFee {
    code: string;
    approximateInd: boolean;
    value: number;
}

interface IRestriction {
    value: string;
}

interface ITicketingAgency {
    "@type": "TicketingAgency";
    Code: string;
}

interface IFareGuaranteePolicy {
    "@type": "FareGuaranteePolicy";
    Code: ICode;
}

interface ICode {
    value: string;
}

interface IIdentifier {
    value: string;
}

interface IReferenceList {
    "@type": "ReferenceListBrand";
    Brand: IBrandReference[];
}

interface IBrandReference {
    "@type": "Brand";
    name: string;
    tier: number;
    code: string;
    id: string;
    Identifier: IBrandIdentifier;
    BrandAttribute: IBrandAttribute[];
}

interface IBrandIdentifier {
    authority: string;
    value: string;
}

/////////-----------FLIGHT REVALIDATE RESPONSE END---------------///////////




////////////---------FLIGHT BOOKING TRAVELER REQUEST START-------------////////////
export interface IFlightBookingTraveler {
    Traveler: ITraveler
}

interface ITraveler {
    "@type": "Traveler";
    birthDate: string | Date | null;
    gender: "Male" | "Female";
    passengerTypeCode: "ADT" | "INF" | "CNN";
    PersonName: IPersonNameDetail;
    id?: string;
    Address?: IAddress[];
    Telephone?: ITelephone[];
    Email?: IEmail[];
    CustomerLoyalty?: ICustomerLoyalty[];
    TravelDocument?: ITravelDocumentDetail[];
}

export interface IPersonNameDetail {
    "@type": "PersonNameDetail";
    Prefix?: string; //"Mr" | "Ms" | "Mrs"
    Given: string;
    Surname: string;
}

export interface IAddress {
    "@type": "Address";
    role: string;
    Number: IAddressNumber;
    Street: string;
    City: string;
    County: string;
    StateProv: IStateProv;
    PostalCode: string;
}

export interface IAddressNumber {
    value: string;
}

export interface IStateProv {
    name: string;
    value: string;
}

export interface ITelephone {
    "@type": "Telephone";
    phoneNumber: string;
    areaCityCode?: string;
    role: "Mobile" | "Home" | "Work" | "Office" | "Fax" | "Other";
}

export interface IEmail {
    value: string;
}

export interface ICustomerLoyalty {
    supplier: string;
    value: string;
}

export interface ITravelDocumentDetail {
    "@type": "TravelDocumentDetail" | "TravelDocument";
    docNumber: string;
    docType: "Passport";
    expireDate?: string | Date;
    issueCountry?: string;
    birthDate?: string | Date | null;
    birthCountry?: string;
    Gender?: "Male" | "Female";
    PersonName: IPersonName;
}

export interface IPersonName {
    "@type": "PersonName";
    Prefix: string;
    Given: string;
    Surname: string;
}
////////////---------FLIGHT BOOKING TRAVELER REQUEST END-------------////////////





/////////////----------FLIGHT BOOKING CANCEL RESPONSE START-------------////////////////
export interface IBookingCancel {
    ReceiptListResponse: IBookingCancelReceiptList;
}

interface IBookingCancelReceiptList {
    "@type": "ReceiptListResponse";
    transactionId?: string;
    traceId?: string;
    ReceiptID?: IBookingCancelReceiptID[];
    Result?: IBookingCancelResult
}

interface IBookingCancelReceiptID {
    "@type": "ReceiptCancellation";
    id: string;
    Identifier: IBrandIdentifier;
    Cancellation: ICancellation;
}

interface ICancellation {
    "@type": "CancellationHold",
    Locator: ILocator;
}

interface ILocator {
    locatorType: string;
    source: string;
    sourceContext: string;
    value: string;
}

interface IBookingCancelResult {
    "@type": "Result",
    Error: IErrorDetails[];
}
interface IErrorDetails {
    "@type": "ErrorDetail";
    category: string;
    StatusCode: number;
    Message: string;
    SourceID: string;
    SourceCode: string;
}
/////////////----------FLIGHT BOOKING CANCEL RESPONSE END-------------////////////////