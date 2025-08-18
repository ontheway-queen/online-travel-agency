const { parseStringPromise } = require('xml2js');

export class SoapJsonConverter {
  public async xmlToJson(xmlString: any) {
    console.log("calling");
    try {
      const result = await parseStringPromise(xmlString, {
        explicitArray: false,
        mergeAttrs: false,
        trim: true,
        normalizeTags: false,
        explicitRoot: false,
        valueProcessors: [
          (value: string, name: string) => {
            if (/^-?\d+(\.\d+)?$/.test(value)) return parseFloat(value);
            if (value === 'true') return true;
            if (value === 'false') return false;
            if (name === 'i:nil' && value === 'true') return null;
            return value;
          },
        ],
      });
      return result;
    } catch (error: any) {
      console.error('Error parsing XML:', error.message);
      return false;
    }
  }
}

