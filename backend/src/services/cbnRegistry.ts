export interface CBNBankInfo {
  code: string;           // 6-digit CBN Institution Code (e.g. "000013")
  shortCode: string;      // 3-digit legacy code if applicable (e.g. "058")
  name: string;           // Canonical Name
  shortName: string;      // Common short name (e.g. "GTBank")
  aliases: string[];      // Variations found on receipts
  type: 'COMMERCIAL' | 'FINTECH_MFB' | 'MERCHANT' | 'PAYMENT_SERVICE';
  primaryColor: string;
  badgeTextColor: string;
}

export const CBN_INSTITUTION_REGISTRY: Record<string, CBNBankInfo> = {
  '000013': {
    code: '000013',
    shortCode: '058',
    name: 'Guaranty Trust Bank PLC',
    shortName: 'GTBank',
    aliases: ['gtbank', 'gtco', 'guaranty trust bank', 'gt bank plc', 'gtb'],
    type: 'COMMERCIAL',
    primaryColor: '#dd4f05',
    badgeTextColor: '#ffffff'
  },
  '000014': {
    code: '000014',
    shortCode: '044',
    name: 'Access Bank PLC',
    shortName: 'Access Bank',
    aliases: ['access', 'access bank', 'access bank plc', 'diamond bank'],
    type: 'COMMERCIAL',
    primaryColor: '#002663',
    badgeTextColor: '#ffffff'
  },
  '000015': {
    code: '000015',
    shortCode: '057',
    name: 'Zenith Bank PLC',
    shortName: 'Zenith Bank',
    aliases: ['zenith', 'zenith bank', 'zenith bank plc'],
    type: 'COMMERCIAL',
    primaryColor: '#c51b24',
    badgeTextColor: '#ffffff'
  },
  '000011': {
    code: '000011',
    shortCode: '011',
    name: 'First Bank of Nigeria',
    shortName: 'FirstBank',
    aliases: ['first bank', 'firstbank', 'first bank of nigeria', 'fbn'],
    type: 'COMMERCIAL',
    primaryColor: '#003b64',
    badgeTextColor: '#ffffff'
  },
  '000016': {
    code: '000016',
    shortCode: '033',
    name: 'United Bank for Africa',
    shortName: 'UBA',
    aliases: ['uba', 'united bank for africa', 'uba plc'],
    type: 'COMMERCIAL',
    primaryColor: '#d60b13',
    badgeTextColor: '#ffffff'
  },
  '000017': {
    code: '000017',
    shortCode: '035',
    name: 'Wema Bank PLC',
    shortName: 'Wema Bank / ALAT',
    aliases: ['wema', 'wema bank', 'alat', 'alat by wema'],
    type: 'COMMERCIAL',
    primaryColor: '#7a1244',
    badgeTextColor: '#ffffff'
  },
  '000023': {
    code: '000023',
    shortCode: '221',
    name: 'Stanbic IBTC Bank',
    shortName: 'Stanbic IBTC',
    aliases: ['stanbic', 'stanbic ibtc', 'stanbic ibtc bank'],
    type: 'COMMERCIAL',
    primaryColor: '#0033aa',
    badgeTextColor: '#ffffff'
  },
  '000010': {
    code: '000010',
    shortCode: '070',
    name: 'Fidelity Bank PLC',
    shortName: 'Fidelity Bank',
    aliases: ['fidelity', 'fidelity bank', 'fidelity bank plc'],
    type: 'COMMERCIAL',
    primaryColor: '#0d257a',
    badgeTextColor: '#ffffff'
  },
  '000007': {
    code: '000007',
    shortCode: '232',
    name: 'Sterling Bank PLC',
    shortName: 'Sterling Bank',
    aliases: ['sterling', 'sterling bank', 'sterling bank plc'],
    type: 'COMMERCIAL',
    primaryColor: '#840b17',
    badgeTextColor: '#ffffff'
  },
  '000003': {
    code: '000003',
    shortCode: '214',
    name: 'First City Monument Bank',
    shortName: 'FCMB',
    aliases: ['fcmb', 'first city monument bank'],
    type: 'COMMERCIAL',
    primaryColor: '#5c068c',
    badgeTextColor: '#ffffff'
  },
  '000002': {
    code: '000002',
    shortCode: '032',
    name: 'Union Bank of Nigeria',
    shortName: 'Union Bank',
    aliases: ['union bank', 'union bank of nigeria'],
    type: 'COMMERCIAL',
    primaryColor: '#0090d0',
    badgeTextColor: '#ffffff'
  },
  '000008': {
    code: '000008',
    shortCode: '076',
    name: 'Polaris Bank',
    shortName: 'Polaris Bank',
    aliases: ['polaris', 'polaris bank', 'skye bank'],
    type: 'COMMERCIAL',
    primaryColor: '#571c5d',
    badgeTextColor: '#ffffff'
  },
  '000028': {
    code: '000028',
    shortCode: '101',
    name: 'Providus Bank',
    shortName: 'Providus Bank',
    aliases: ['providus', 'providus bank'],
    type: 'COMMERCIAL',
    primaryColor: '#1d2327',
    badgeTextColor: '#ffffff'
  },
  '090405': {
    code: '090405',
    shortCode: '50515',
    name: 'Moniepoint Microfinance Bank',
    shortName: 'Moniepoint',
    aliases: ['moniepoint', 'moniepoint mfb', 'teamapt'],
    type: 'FINTECH_MFB',
    primaryColor: '#0047ff',
    badgeTextColor: '#ffffff'
  },
  '100004': {
    code: '100004',
    shortCode: '999991',
    name: 'OPay Digital Services',
    shortName: 'OPay',
    aliases: ['opay', 'opay digital services', 'paycom', 'paycom (opay)'],
    type: 'FINTECH_MFB',
    primaryColor: '#15b078',
    badgeTextColor: '#ffffff'
  },
  '100033': {
    code: '100033',
    shortCode: '999992',
    name: 'PalmPay Limited',
    shortName: 'PalmPay',
    aliases: ['palmpay', 'palmpay limited'],
    type: 'FINTECH_MFB',
    primaryColor: '#6c21e0',
    badgeTextColor: '#ffffff'
  },
  '090267': {
    code: '090267',
    shortCode: '50211',
    name: 'Kuda Microfinance Bank',
    shortName: 'Kuda Bank',
    aliases: ['kuda', 'kuda bank', 'kuda microfinance bank'],
    type: 'FINTECH_MFB',
    primaryColor: '#40196d',
    badgeTextColor: '#ffffff'
  },
  '090110': {
    code: '090110',
    shortCode: '566',
    name: 'VFD Microfinance Bank',
    shortName: 'VBank / VFD',
    aliases: ['vfd', 'vfd mfb', 'vbank'],
    type: 'FINTECH_MFB',
    primaryColor: '#b41c2c',
    badgeTextColor: '#ffffff'
  },
  '090551': {
    code: '090551',
    shortCode: '51318',
    name: 'FairMoney Microfinance Bank',
    shortName: 'FairMoney',
    aliases: ['fairmoney', 'fairmoney mfb'],
    type: 'FINTECH_MFB',
    primaryColor: '#0288d1',
    badgeTextColor: '#ffffff'
  },
  '090540': {
    code: '090540',
    shortCode: '565',
    name: 'Carbon Microfinance Bank',
    shortName: 'Carbon',
    aliases: ['carbon', 'carbon mfb', 'paylater'],
    type: 'FINTECH_MFB',
    primaryColor: '#013b5e',
    badgeTextColor: '#ffffff'
  },
  '090558': {
    code: '090558',
    shortCode: '51341',
    name: 'Pocket App by Piggyvest',
    shortName: 'Pocket (Piggyvest)',
    aliases: ['pocket', 'pocketapp', 'piggyvest', 'pocket app'],
    type: 'FINTECH_MFB',
    primaryColor: '#0052cc',
    badgeTextColor: '#ffffff'
  }
};

/**
 * Normalizes bank name query and resolves to CBN Institution Code & Record
 */
export function lookupBankByNameOrCode(query: string): CBNBankInfo | null {
  if (!query) return null;
  const clean = query.trim().toLowerCase();

  // Direct 6-digit match
  if (CBN_INSTITUTION_REGISTRY[clean]) {
    return CBN_INSTITUTION_REGISTRY[clean];
  }

  // Exact or partial alias search
  for (const info of Object.values(CBN_INSTITUTION_REGISTRY)) {
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

export function getAllCBNBanks(): CBNBankInfo[] {
  return Object.values(CBN_INSTITUTION_REGISTRY);
}

