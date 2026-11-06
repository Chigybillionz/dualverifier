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
  // --- TIER 1 & TOP COMMERCIAL BANKS ---
  '000013': {
    code: '000013',
    shortCode: '058',
    name: 'Guaranty Trust Bank PLC',
    shortName: 'GTBank',
    aliases: ['gtbank', 'gtco', 'guaranty trust bank', 'gt bank', 'gtb', 'guaranty trust'],
    type: 'COMMERCIAL',
    brandColor: '#dd4f05',
    accentColor: '#ffffff'
  },
  '000014': {
    code: '000014',
    shortCode: '044',
    name: 'Access Bank PLC',
    shortName: 'Access Bank',
    aliases: ['access', 'access bank', 'access bank plc', 'diamond bank', 'access cliq'],
    type: 'COMMERCIAL',
    brandColor: '#002663',
    accentColor: '#ffffff'
  },
  '000015': {
    code: '000015',
    shortCode: '057',
    name: 'Zenith Bank PLC',
    shortName: 'Zenith Bank',
    aliases: ['zenith', 'zenith bank', 'zenith bank plc', 'zenith mobile'],
    type: 'COMMERCIAL',
    brandColor: '#c51b24',
    accentColor: '#ffffff'
  },
  '000011': {
    code: '000011',
    shortCode: '011',
    name: 'First Bank of Nigeria',
    shortName: 'FirstBank',
    aliases: ['first bank', 'firstbank', 'first bank of nigeria', 'fbn', 'firstmonie'],
    type: 'COMMERCIAL',
    brandColor: '#003b64',
    accentColor: '#ffffff'
  },
  '000016': {
    code: '000016',
    shortCode: '033',
    name: 'United Bank for Africa',
    shortName: 'UBA',
    aliases: ['uba', 'united bank for africa', 'uba plc', 'leo'],
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
    aliases: ['sterling', 'sterling bank', 'sterling bank plc', 'sterling onebank'],
    type: 'COMMERCIAL',
    brandColor: '#840b17',
    accentColor: '#ffffff'
  },
  '000003': {
    code: '000003',
    shortCode: '214',
    name: 'First City Monument Bank',
    shortName: 'FCMB',
    aliases: ['fcmb', 'first city monument bank', 'fcmb mobile'],
    type: 'COMMERCIAL',
    brandColor: '#5c068c',
    accentColor: '#ffffff'
  },
  '000002': {
    code: '000002',
    shortCode: '032',
    name: 'Union Bank of Nigeria',
    shortName: 'Union Bank',
    aliases: ['union bank', 'union bank of nigeria', 'union', 'uniononline'],
    type: 'COMMERCIAL',
    brandColor: '#0090d0',
    accentColor: '#ffffff'
  },
  '000008': {
    code: '000008',
    shortCode: '076',
    name: 'Polaris Bank',
    shortName: 'Polaris Bank',
    aliases: ['polaris', 'polaris bank', 'skye bank', 'vulte'],
    type: 'COMMERCIAL',
    brandColor: '#4f1a63',
    accentColor: '#ffffff'
  },
  '000026': {
    code: '000026',
    shortCode: '082',
    name: 'Keystone Bank',
    shortName: 'Keystone Bank',
    aliases: ['keystone', 'keystone bank', 'bankphb'],
    type: 'COMMERCIAL',
    brandColor: '#003057',
    accentColor: '#ffffff'
  },
  '000012': {
    code: '000012',
    shortCode: '050',
    name: 'Ecobank Nigeria',
    shortName: 'Ecobank',
    aliases: ['ecobank', 'ecobank nigeria', 'ecobank plc'],
    type: 'COMMERCIAL',
    brandColor: '#005b82',
    accentColor: '#ffffff'
  },
  '000018': {
    code: '000018',
    shortCode: '215',
    name: 'Unity Bank PLC',
    shortName: 'Unity Bank',
    aliases: ['unity', 'unity bank', 'unity bank plc'],
    type: 'COMMERCIAL',
    brandColor: '#ed6c00',
    accentColor: '#ffffff'
  },
  '000021': {
    code: '000021',
    shortCode: '068',
    name: 'Standard Chartered Bank',
    shortName: 'Standard Chartered',
    aliases: ['standard chartered', 'stanchart', 'scb'],
    type: 'COMMERCIAL',
    brandColor: '#007934',
    accentColor: '#ffffff'
  },
  '000028': {
    code: '000028',
    shortCode: '101',
    name: 'Providus Bank',
    shortName: 'Providus Bank',
    aliases: ['providus', 'providus bank', 'providusplus'],
    type: 'COMMERCIAL',
    brandColor: '#1d2327',
    accentColor: '#ffffff'
  },
  '000006': {
    code: '000006',
    shortCode: '301',
    name: 'Jaiz Bank PLC',
    shortName: 'Jaiz Bank',
    aliases: ['jaiz', 'jaiz bank'],
    type: 'COMMERCIAL',
    brandColor: '#005028',
    accentColor: '#ffffff'
  },
  '000027': {
    code: '000027',
    shortCode: '302',
    name: 'TAJBank PLC',
    shortName: 'TAJBank',
    aliases: ['tajbank', 'taj bank'],
    type: 'COMMERCIAL',
    brandColor: '#93278f',
    accentColor: '#ffffff'
  },
  '000029': {
    code: '000029',
    shortCode: '303',
    name: 'Lotus Bank',
    shortName: 'Lotus Bank',
    aliases: ['lotus', 'lotus bank'],
    type: 'COMMERCIAL',
    brandColor: '#00a850',
    accentColor: '#ffffff'
  },
  '000024': {
    code: '000024',
    shortCode: '103',
    name: 'Globus Bank',
    shortName: 'Globus Bank',
    aliases: ['globus', 'globus bank'],
    type: 'COMMERCIAL',
    brandColor: '#004276',
    accentColor: '#ffffff'
  },
  '000025': {
    code: '000025',
    shortCode: '102',
    name: 'Titan Trust Bank',
    shortName: 'Titan Trust',
    aliases: ['titan trust', 'titan trust bank', 'ttb'],
    type: 'COMMERCIAL',
    brandColor: '#0065a4',
    accentColor: '#ffffff'
  },
  '000030': {
    code: '000030',
    shortCode: '104',
    name: 'Parallex Bank',
    shortName: 'Parallex',
    aliases: ['parallex', 'parallex bank'],
    type: 'COMMERCIAL',
    brandColor: '#c8102e',
    accentColor: '#ffffff'
  },
  '000031': {
    code: '000031',
    shortCode: '105',
    name: 'PremiumTrust Bank',
    shortName: 'PremiumTrust',
    aliases: ['premium trust', 'premiumtrust bank'],
    type: 'COMMERCIAL',
    brandColor: '#003366',
    accentColor: '#ffffff'
  },

  // --- FINTECHS & MICROFINANCE BANKS (MFB) ---
  '100004': {
    code: '100004',
    shortCode: '999991',
    name: 'OPay Digital Services (PayCom)',
    shortName: 'OPay',
    aliases: ['opay', 'opay digital services', 'paycom', 'paycom (opay)', 'opay transfer', 'opay app'],
    type: 'FINTECH_MFB',
    brandColor: '#15b078',
    accentColor: '#ffffff'
  },
  '090405': {
    code: '090405',
    shortCode: '50515',
    name: 'Moniepoint Microfinance Bank',
    shortName: 'Moniepoint',
    aliases: ['moniepoint', 'moniepoint mfb', 'teamapt', 'moniepoint inc', 'moniepoint pos'],
    type: 'FINTECH_MFB',
    brandColor: '#0047ff',
    accentColor: '#ffffff'
  },
  '100033': {
    code: '100033',
    shortCode: '999992',
    name: 'PalmPay Limited',
    shortName: 'PalmPay',
    aliases: ['palmpay', 'palmpay limited', 'palmpay app', 'transsnet'],
    type: 'FINTECH_MFB',
    brandColor: '#6c21e0',
    accentColor: '#ffffff'
  },
  '090267': {
    code: '090267',
    shortCode: '50211',
    name: 'Kuda Microfinance Bank',
    shortName: 'Kuda Bank',
    aliases: ['kuda', 'kuda bank', 'kuda microfinance bank', 'kudabank'],
    type: 'FINTECH_MFB',
    brandColor: '#40196d',
    accentColor: '#ffffff'
  },
  '090110': {
    code: '090110',
    shortCode: '566',
    name: 'VFD Microfinance Bank',
    shortName: 'VBank / VFD',
    aliases: ['vfd', 'vfd mfb', 'vbank', 'vfd microfinance bank'],
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
  },
  '090130': {
    code: '090130',
    shortCode: '565',
    name: 'Carbon (One Finance)',
    shortName: 'Carbon',
    aliases: ['carbon', 'one finance', 'carbon mfb', 'paylater'],
    type: 'FINTECH_MFB',
    brandColor: '#1a1a2e',
    accentColor: '#ffffff'
  },
  '100002': {
    code: '100002',
    shortCode: '327',
    name: 'Paga',
    shortName: 'Paga',
    aliases: ['paga', 'pagatech', 'mypaga'],
    type: 'FINTECH_MFB',
    brandColor: '#f26522',
    accentColor: '#ffffff'
  },
  '100039': {
    code: '100039',
    shortCode: '51211',
    name: 'Pocket by PiggyVest',
    shortName: 'PocketApp',
    aliases: ['pocket', 'pocketapp', 'piggyvest', 'pocket by piggyvest'],
    type: 'FINTECH_MFB',
    brandColor: '#0052cc',
    accentColor: '#ffffff'
  },
  '090470': {
    code: '090470',
    shortCode: '51320',
    name: 'Dot Microfinance Bank',
    shortName: 'Dot MFB',
    aliases: ['dot', 'dot mfb', 'dot bank'],
    type: 'FINTECH_MFB',
    brandColor: '#e60000',
    accentColor: '#ffffff'
  },
  '090175': {
    code: '090175',
    shortCode: '125',
    name: 'Rubies Microfinance Bank',
    shortName: 'Rubies Bank',
    aliases: ['rubies', 'rubies mfb', 'rubies bank'],
    type: 'FINTECH_MFB',
    brandColor: '#c41d7f',
    accentColor: '#ffffff'
  },
  '100038': {
    code: '100038',
    shortCode: '51319',
    name: 'Chipper Cash',
    shortName: 'Chipper Cash',
    aliases: ['chipper', 'chipper cash', 'critical ideas'],
    type: 'FINTECH_MFB',
    brandColor: '#383bfe',
    accentColor: '#ffffff'
  },
  '090328': {
    code: '090328',
    shortCode: '567',
    name: 'Eyowo MFB',
    shortName: 'Eyowo',
    aliases: ['eyowo', 'eyowo mfb'],
    type: 'FINTECH_MFB',
    brandColor: '#000000',
    accentColor: '#ffffff'
  },
  '100010': {
    code: '100010',
    shortCode: '304',
    name: 'Baxi / CapriDigital',
    shortName: 'Baxi',
    aliases: ['baxi', 'baxibox', 'capridigital'],
    type: 'FINTECH_MFB',
    brandColor: '#008080',
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

  // Fallback pattern match for generic Fintech or Bank
  if (clean.includes('opay') || clean.includes('paycom')) return CBN_BANK_REGISTRY['100004'];
  if (clean.includes('moniepoint') || clean.includes('teamapt')) return CBN_BANK_REGISTRY['090405'];
  if (clean.includes('palmpay')) return CBN_BANK_REGISTRY['100033'];
  if (clean.includes('kuda')) return CBN_BANK_REGISTRY['090267'];
  if (clean.includes('gtb') || clean.includes('guaranty') || clean.includes('gtco')) return CBN_BANK_REGISTRY['000013'];
  if (clean.includes('access')) return CBN_BANK_REGISTRY['000014'];
  if (clean.includes('zenith')) return CBN_BANK_REGISTRY['000015'];
  if (clean.includes('firstbank') || clean.includes('first bank')) return CBN_BANK_REGISTRY['000011'];
  if (clean.includes('uba') || clean.includes('united bank')) return CBN_BANK_REGISTRY['000016'];
  if (clean.includes('wema') || clean.includes('alat')) return CBN_BANK_REGISTRY['000017'];

  return null;
}

export function getAllCbnBanks(): CBNBankRecord[] {
  return Object.values(CBN_BANK_REGISTRY);
}
