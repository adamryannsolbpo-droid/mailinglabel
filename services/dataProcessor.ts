import * as XLSX from 'xlsx';
import { LabelData, RawRow } from '../types';

// Helper to convert string to Title Case
const toTitleCase = (str: string) => {
  if (!str) return '';
  return str.toLowerCase().replace(/\b(\w)/g, (s) => s.toUpperCase());
};

// Normalize keys to find address fields regardless of casing or slight variations
const normalizeKey = (key: string) => key.toLowerCase().replace(/[^a-z0-9]/g, '');

const MAILING_KEYWORDS = ['mail', 'current'];
const PROPERTY_KEYWORDS = ['prop', 'situs', 'location'];
const ADDR_KEYWORDS = ['addr', 'street', 'line1'];
const CITY_KEYWORDS = ['city'];
const STATE_KEYWORDS = ['state', 'st'];
const ZIP_KEYWORDS = ['zip', 'post'];
const NAME_KEYWORDS = ['name', 'owner', 'recipient'];

const findColumnValue = (row: RawRow, headers: string[], typeKeywords: string[], fieldKeywords: string[]): string | undefined => {
  // Priority 1: Check for combination (e.g., "Mailing City")
  for (const header of headers) {
    const norm = normalizeKey(header);
    const hasType = typeKeywords.some(k => norm.includes(k));
    const hasField = fieldKeywords.some(k => norm.includes(k));
    
    if (hasType && hasField && row[header]) {
      return String(row[header]).trim();
    }
  }

  // Priority 2: If we are looking for Property address, and there are no specific "Property" prefixes, 
  // sometimes "Address" implies Property if "Mailing" is explicitly elsewhere. 
  // But for safety, we are strict. 
  
  // Priority 3: Check for generic field name if no type conflict (e.g. just "City" usually implies Property unless Mailing City exists)
  // This logic can be complex. We will try a robust best-effort match.
  
  return undefined;
};

// Simplified finder for generic columns if specific ones aren't found
const findGenericValue = (row: RawRow, headers: string[], fieldKeywords: string[], excludeKeywords: string[]): string | undefined => {
  for (const header of headers) {
    const norm = normalizeKey(header);
    const hasField = fieldKeywords.some(k => norm.includes(k));
    const hasExclude = excludeKeywords.some(k => norm.includes(k));
    
    if (hasField && !hasExclude && row[header]) {
      return String(row[header]).trim();
    }
  }
  return undefined;
};

export const processFiles = async (files: File[]): Promise<LabelData[]> => {
  let combinedData: RawRow[] = [];

  // 1. Parse all files
  for (const file of files) {
    const data = await parseFile(file);
    combinedData = [...combinedData, ...data];
  }

  const cleanedLabels: LabelData[] = [];
  const processedSignatures = new Set<string>();

  // 2. Process rows
  combinedData.forEach((row, index) => {
    const headers = Object.keys(row);

    // Extract Mailing Fields
    let mAddr = findColumnValue(row, headers, MAILING_KEYWORDS, ADDR_KEYWORDS);
    let mCity = findColumnValue(row, headers, MAILING_KEYWORDS, CITY_KEYWORDS);
    let mState = findColumnValue(row, headers, MAILING_KEYWORDS, STATE_KEYWORDS);
    let mZip = findColumnValue(row, headers, MAILING_KEYWORDS, ZIP_KEYWORDS);

    // Extract Property Fields
    const pAddr = findColumnValue(row, headers, PROPERTY_KEYWORDS, ADDR_KEYWORDS) || 
                  findGenericValue(row, headers, ADDR_KEYWORDS, MAILING_KEYWORDS); // Fallback to "Address" if not specific
    const pCity = findColumnValue(row, headers, PROPERTY_KEYWORDS, CITY_KEYWORDS) || 
                  findGenericValue(row, headers, CITY_KEYWORDS, MAILING_KEYWORDS);
    const pState = findColumnValue(row, headers, PROPERTY_KEYWORDS, STATE_KEYWORDS) || 
                   findGenericValue(row, headers, STATE_KEYWORDS, MAILING_KEYWORDS);
    const pZip = findColumnValue(row, headers, PROPERTY_KEYWORDS, ZIP_KEYWORDS) || 
                 findGenericValue(row, headers, ZIP_KEYWORDS, MAILING_KEYWORDS);

    // Name
    const name = findGenericValue(row, headers, NAME_KEYWORDS, []) || "Current Resident";

    // Logic 2A: Remove invalid entries (Missing BOTH)
    const hasMailing = mAddr && mCity && mState && mZip;
    const hasProperty = pAddr && pCity && pState && pZip;

    if (!hasMailing && !hasProperty) {
      return; // Skip this row
    }

    // Logic 2B: Replace missing mailing with property
    if (!hasMailing && hasProperty) {
      mAddr = pAddr;
      mCity = pCity;
      mState = pState;
      mZip = pZip;
    }

    // Final check: do we have a usable address now?
    if (!mAddr || !mCity || !mState || !mZip) {
      return; // Skip if still incomplete
    }

    // Logic 2C: Formatting
    const cleanAddr = toTitleCase(mAddr);
    const cleanCity = toTitleCase(mCity);
    const cleanState = mState.toUpperCase().substring(0, 2); // Standardize state to 2 chars usually
    const cleanZip = mZip.split('-')[0]; // Simple 5 digit zip often preferred, or keep as is. Let's keep as is but trim.

    const signature = `${name}|${cleanAddr}|${cleanCity}|${cleanState}|${cleanZip}`.toLowerCase();

    // Deduplication
    if (processedSignatures.has(signature)) {
      return;
    }
    processedSignatures.add(signature);

    cleanedLabels.push({
      id: `row-${index}`,
      name: toTitleCase(name),
      address1: cleanAddr,
      city: cleanCity,
      state: cleanState,
      zip: mZip, // Keep original zip formatting (e.g. 12345-6789) if present
    });
  });

  return cleanedLabels;
};

const parseFile = (file: File): Promise<RawRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<RawRow>(sheet);
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
};