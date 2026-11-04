export interface CBNBankRecord {
  code: string;           // 6-digit CBN Bank Code
  shortCode: string;      // 3-digit legacy code
  name: string;           // Canonical Name
  shortName: string;      // Common short name
  aliases: string[];      // Receipt variations
  type: 'COMMERCIAL' | 'FINTECH_MFB' | 'MERCHANT';
  brandColor: string;     // Hex color for visual badge
  accentColor: string;
}

export const CBN_BANK_REGISTRY: Record<string, CBNBankRecord> = {
  '000013': {
    code: '000013',
    shortCode: '058',
    name: 'Guaranty Trust Bank PLC',
    shortName: 'GTBank',
    aliases: ['gtbank', 'gtco', 'guaranty trust bank', 'gt bank', 'gtb'],
    type: 'COMMERCIAL',
    brandColor: '#dd4f05',
    accentColor: '#ffffff'
  },
  '000014': {
    code: '000014',
    shortCode: '044',
    name: 'Access Bank PLC',
    shortName: 'Access Bank',
    aliases: ['access', 'access bank', 'access bank plc', 'diamond bank'],
    type: 'COMMERCIAL',
    brandColor: '#002663',
    accentColor: '#ffffff'
  },
  '000015': {
    code: '000015',
    shortCode: '057',
    name: 'Zenith Bank PLC',
    shortName: 'Zenith Bank',
    aliases: ['zenith', 'zenith bank', 'zenith bank plc'],
    type: 'COMMERCIAL',
    brandColor: '#c51b24',
    accentColor: '#ffffff'
  },
  '000011': {
    code: '000011',
    shortCode: '011',
    name: 'First Bank of Nigeria',
    shortName: 'FirstBank',
    aliases: ['first bank', 'firstbank', 'first bank of nigeria', 'fbn'],
    type: 'COMMERCIAL',
    brandColor: '#003b64',
    accentColor: '#ffffff'
  },
  '000016': {
    code: '000016',
    shortCode: '033',
    name: 'United Bank for Africa',
    shortName: 'UBA',
    aliases: ['uba', 'united bank for africa', 'uba plc'],
    type: 'COMMERCIAL',
    brandColor: '#d60b13',
    accentColor: '#ffffff'
  },
  '000017': {
    code: '000017',
    shortCode: '035',
    name: 'Wema Bank PLC',
    shortName: 'Wema / ALAT',
    aliases: ['wema', 'wema bank', 'alat', 'alat by wema'],
    type: 'COMMERCIAL',
    brandColor: '#7a1244',
    accentColor: '#ffffff'
  },
  '000023': {
    code: '000023',
    shortCode: '221',
    name: 'Stanbic IBTC Bank',
    shortName: 'Stanbic IBTC',
    aliases: ['stanbic', 'stanbic ibtc', 'stanbic ibtc bank'],
    type: 'COMMERCIAL',
    brandColor: '#0033aa',
    accentColor: '#ffffff'
  },
  '000010': {
    code: '000010',
    shortCode: '070',
    name: 'Fidelity Bank PLC',
    shortName: 'Fidelity Bank',
    aliases: ['fidelity', 'fidelity bank', 'fidelity bank plc'],
    type: 'COMMERCIAL',
    brandColor: '#0d257a',
    accentColor: '#ffffff'
  },
  '000007': {
    code: '000007',
    shortCode: '232',
    name: 'Sterling Bank PLC',
    shortName: 'Sterling Bank',
    aliases: ['sterling', 'sterling bank', 'sterling bank plc'],
    type: 'COMMERCIAL',
    brandColor: '#840b17',
    accentColor: '#ffffff'
  },
  '000003': {
    code: '000003',
    shortCode: '214',
    name: 'First City Monument Bank',
    shortName: 'FCMB',
    aliases: ['fcmb', 'first city monument bank'],
    type: 'COMMERCIAL',
    brandColor: '#5c068c',
    accentColor: '#ffffff'
  },
  '000002': {
    code: '000002',
    shortCode: '032',
    name: 'Union Bank of Nigeria',
    shortName: 'Union Bank',
    aliases: ['union bank', 'union bank of nigeria'],
    type: 'COMMERCIAL',
    brandColor: '#0090d0',
    accentColor: '#ffffff'
  },
  '000028': {
    code: '000028',
    shortCode: '101',
    name: 'Providus Bank',
    shortName: 'Providus Bank',
    aliases: ['providus', 'providus bank'],
    type: 'COMMERCIAL',
    brandColor: '#1d2327',
    accentColor: '#ffffff'
  },
  '090405': {
    code: '090405',
    shortCode: '50515',
    name: 'Moniepoint Microfinance Bank',
    shortName: 'Moniepoint',
    aliases: ['moniepoint', 'moniepoint mfb', 'teamapt'],
    type: 'FINTECH_MFB',
    brandColor: '#0047ff',
    accentColor: '#ffffff'
  },
  '100004': {
    code: '100004',
    shortCode: '999991',
    name: 'OPay Digital Services (PayCom)',
    shortName: 'OPay',
    aliases: ['opay', 'opay digital services', 'paycom', 'paycom (opay)'],
    type: 'FINTECH_MFB',
    brandColor: '#15b078',
    accentColor: '#ffffff'
  },
  '100033': {
    code: '100033',
    shortCode: '999992',
    name: 'PalmPay Limited',
    shortName: 'PalmPay',
    aliases: ['palmpay', 'palmpay limited'],
    type: 'FINTECH_MFB',
    brandColor: '#6c21e0',
    accentColor: '#ffffff'
  },
  '090267': {
    code: '090267',
    shortCode: '50211',
    name: 'Kuda Microfinance Bank',
    shortName: 'Kuda Bank',
    aliases: ['kuda', 'kuda bank', 'kuda microfinance bank'],
    type: 'FINTECH_MFB',
    brandColor: '#40196d',
    accentColor: '#ffffff'
  },
  '090110': {
    code: '090110',
    shortCode: '566',
    name: 'VFD Microfinance Bank',
    shortName: 'VBank / VFD',
    aliases: ['vfd', 'vfd mfb', 'vbank'],
    type: 'FINTECH_MFB',
    brandColor: '#b41c2c',
    accentColor: '#ffffff'
  },
  '090551': {
    code: '090551',
    shortCode: '51318',
    name: 'FairMoney Microfinance Bank',
    shortName: 'FairMoney',
    aliases: ['fairmoney', 'fairmoney mfb'],
    type: 'FINTECH_MFB',
    brandColor: '#0288d1',
    accentColor: '#ffffff'
  }
};

/**
 * Look up CBN Bank by 6-digit code or name/alias
 */
export function lookupCbnBank(query: string): CBNBankRecord | null {
  if (!query) return null;
  const clean = query.trim().toLowerCase();

  // Direct 6-digit code match
  if (CBN_BANK_REGISTRY[clean]) {
    return CBN_BANK_REGISTRY[clean];
  }

  // Exact or partial alias search
  for (const info of Object.values(CBN_BANK_REGISTRY)) {
    if (info.code === clean || info.shortCode === clean) return info;
    if (info.shortName.toLowerCase() === clean || info.name.toLowerCase() === clean) return info;
    for (const alias of info.aliases) {
      if (clean === alias || clean.includes(alias) || alias.includes(clean)) {
        return info;
      }
    }
  }

  return null;
}

export function getAllCbnBanks(): CBNBankRecord[] {
  return Object.values(CBN_BANK_REGISTRY);
}

