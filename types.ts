export interface RawRow {
  [key: string]: string | number | undefined | null;
}

export interface LabelData {
  id: string;
  name: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  originalSource?: string;
}

export interface LabelTemplate {
  id: '30-up' | '20-up' | '10-up';
  name: string;
  description: string;
  labelsPerPage: number;
  rows: number;
  cols: number;
  // Dimensions in inches
  pageWidth: number;
  pageHeight: number;
  marginTop: number;
  marginLeft: number;
  labelWidth: number;
  labelHeight: number;
  horizontalGap: number;
  verticalGap: number;
  fontSize: number; // pt
}

export const TEMPLATES: Record<string, LabelTemplate> = {
  '30-up': {
    id: '30-up',
    name: '30 Labels (Avery 5160)',
    description: 'Standard address labels, 1" x 2.625"',
    labelsPerPage: 30,
    rows: 10,
    cols: 3,
    pageWidth: 8.5,
    pageHeight: 11,
    marginTop: 0.5,
    marginLeft: 0.1875,
    labelWidth: 2.625,
    labelHeight: 1,
    horizontalGap: 0.125,
    verticalGap: 0,
    fontSize: 11
  },
  '20-up': {
    id: '20-up',
    name: '20 Labels (Shipping)',
    description: 'Larger labels, 2" x 4" (Avery 5163)',
    labelsPerPage: 10, // Actually 2x5 usually for 2x4 labels, but let's assume standard 10 per page shipping labels
    rows: 5,
    cols: 2,
    pageWidth: 8.5,
    pageHeight: 11,
    marginTop: 0.5,
    marginLeft: 0.156,
    labelWidth: 4,
    labelHeight: 2,
    horizontalGap: 0.188,
    verticalGap: 0,
    fontSize: 14
  },
  // Note: 20-up 1" x 4" exists (Avery 5161), but user requested 20 and 10 per sheet specifically.
  // Let's implement specific user requests roughly mapping to standard sizes.
  '20-up-custom': {
     id: '20-up',
     name: '20 Labels (2 columns x 10 rows)',
     description: '1" x 4" labels (Avery 5161)',
     labelsPerPage: 20,
     rows: 10,
     cols: 2,
     pageWidth: 8.5,
     pageHeight: 11,
     marginTop: 0.5,
     marginLeft: 0.156,
     labelWidth: 4,
     labelHeight: 1,
     horizontalGap: 0.188,
     verticalGap: 0,
     fontSize: 12
  },
  '10-up': {
    id: '10-up',
    name: '10 Labels (Shipping)',
    description: '2" x 4" labels (Avery 5163)',
    labelsPerPage: 10,
    rows: 5,
    cols: 2,
    pageWidth: 8.5,
    pageHeight: 11,
    marginTop: 0.5,
    marginLeft: 0.156,
    labelWidth: 4,
    labelHeight: 2,
    horizontalGap: 0.188,
    verticalGap: 0,
    fontSize: 16
  }
};