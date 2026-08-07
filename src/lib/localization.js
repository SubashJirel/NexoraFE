import { adToBs, bsToAd } from '@sbmdkl/nepali-date-converter'

export const NEPAL_TIMEZONE = 'Asia/Kathmandu'
const NEPALI_DIGITS = '०१२३४५६७८९'
const BS_MONTHS = {
  en: ['Baishakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin', 'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'],
  ne: ['वैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज', 'कात्तिक', 'मंसिर', 'पुस', 'माघ', 'फागुन', 'चैत'],
}

export const TRANSLATIONS = {
  ne: {
    Overview: 'अवलोकन', Dashboard: 'ड्यासबोर्ड', CRM: 'सीआरएम', Leads: 'लिडहरू', Inbox: 'इनबक्स', Contacts: 'सम्पर्कहरू', Agents: 'एजेन्टहरू',
    'Site Visits': 'साइट भिजिट', Deals: 'डिलहरू', Offers: 'अफरहरू', Owners: 'धनीहरू', Leases: 'लिजहरू', Tasks: 'कार्यहरू', Calendar: 'क्यालेन्डर', Appointments: 'अपोइन्टमेन्ट',
    Listings: 'लिस्टिङ', Properties: 'सम्पत्तिहरू', 'Smart Matching': 'स्मार्ट मिलान', Compare: 'तुलना', Documents: 'कागजातहरू', Marketing: 'मार्केटिङ',
    'Social Media': 'सामाजिक सञ्जाल', 'Website Content': 'वेबसाइट सामग्री', 'Web Submissions': 'वेब अनुरोधहरू', 'Agent Reviews': 'एजेन्ट समीक्षा', Reports: 'रिपोर्ट', Analytics: 'विश्लेषण',
    Account: 'खाता', 'My Profile': 'मेरो प्रोफाइल', Notifications: 'सूचनाहरू', 'Team & Invites': 'टोली र निमन्त्रणा', Availability: 'उपलब्धता', Customization: 'अनुकूलन',
    'Audit Log': 'अडिट लग', Billing: 'बिलिङ', 'Platform Admin': 'प्लेटफर्म प्रशासन', Settings: 'सेटिङ', Logout: 'लगआउट', User: 'प्रयोगकर्ता',
    English: 'अंग्रेजी', Nepali: 'नेपाली', 'Nepali digits': 'नेपाली अंक', 'Nepal time': 'नेपाल समय',
    'Agency settings': 'एजेन्सी सेटिङ', 'Save changes': 'परिवर्तन सुरक्षित गर्नुहोस्', 'Save agency settings': 'एजेन्सी सेटिङ सुरक्षित गर्नुहोस्',
    'Agency profile': 'एजेन्सी प्रोफाइल', Location: 'स्थान', 'Public website': 'सार्वजनिक वेबसाइट', 'Social and messaging': 'सामाजिक सञ्जाल र सन्देश', 'Brand media': 'ब्रान्ड सामग्री',
    Localization: 'स्थानीयकरण', 'Default interface language': 'पूर्वनिर्धारित भाषा', 'Default date system': 'पूर्वनिर्धारित मिति प्रणाली',
    Province: 'प्रदेश', District: 'जिल्ला', Municipality: 'नगरपालिका/गाउँपालिका', Ward: 'वडा नं.', Tole: 'टोल', Address: 'ठेगाना', Phone: 'फोन',
    'Message templates': 'सन्देश ढाँचाहरू', Subject: 'विषय', Message: 'सन्देश', 'Property details': 'सम्पत्तिको विवरण',
    'Distribution toolkit': 'वितरण टुलकिट', Download: 'डाउनलोड', Copy: 'प्रतिलिपि', 'Portal CSV': 'पोर्टल CSV',
    'Good morning': 'शुभ प्रभात', 'Good afternoon': 'शुभ दिउँसो', 'Good evening': 'शुभ सन्ध्या',
    'Total Leads': 'कुल लिड', 'Site Visits Today': 'आजका साइट भिजिट', Inquiries: 'सोधपुछ', 'Follow-ups Due': 'बाँकी फलो-अप',
    'Leads by Status': 'स्थितिअनुसार लिड', 'Top Properties': 'शीर्ष सम्पत्ति', 'Lead Sources': 'लिड स्रोत', 'Quick Overview': 'छोटो अवलोकन',
    'Total Listings': 'कुल लिस्टिङ', Available: 'उपलब्ध', 'Under Negotiation': 'वार्तामा', Sold: 'बिक्री भएको',
  },
}

export function toNepaliDigits(value) {
  return String(value).replace(/\d/g, (digit) => NEPALI_DIGITS[Number(digit)])
}

export function toLatinDigits(value) {
  return String(value).replace(/[०-९]/g, (digit) => String(NEPALI_DIGITS.indexOf(digit)))
}

function adDateParts(value) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: NEPAL_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date).reduce((result, part) => ({ ...result, [part.type]: part.value }), {})
  return `${parts.year}-${parts.month}-${parts.day}`
}

export function convertDate(value, target = 'bs') {
  if (target === 'bs') {
    const input = adDateParts(value)
    return input ? adToBs(input) : ''
  }
  return bsToAd(toLatinDigits(value))
}

export function formatDate(value, { language = 'en', dateSystem = 'ad', nepaliDigits = false, includeTime = false } = {}) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return value || ''
  let rendered
  if (dateSystem === 'bs') {
    const converted = convertDate(date, 'bs')
    const [year, month, day] = converted.split('-').map(Number)
    rendered = language === 'ne'
      ? `${year} ${BS_MONTHS.ne[month - 1]} ${day} गते`
      : `${day} ${BS_MONTHS.en[month - 1]} ${year} BS`
    if (includeTime) {
      rendered += ` ${new Intl.DateTimeFormat(language === 'ne' ? 'ne-NP' : 'en-GB', { timeZone: NEPAL_TIMEZONE, hour: 'numeric', minute: '2-digit' }).format(date)}`
    }
  } else {
    rendered = new Intl.DateTimeFormat(language === 'ne' ? 'ne-NP' : 'en-GB', {
      timeZone: NEPAL_TIMEZONE, day: 'numeric', month: 'short', year: 'numeric',
      ...(includeTime ? { hour: 'numeric', minute: '2-digit' } : {}),
    }).format(date)
  }
  return nepaliDigits ? toNepaliDigits(rendered) : rendered
}

export function formatNumber(value, { nepaliDigits = false, maximumFractionDigits = 2 } = {}) {
  const rendered = Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits })
  return nepaliDigits ? toNepaliDigits(rendered) : rendered
}

export function formatCurrency(value, { language = 'en', nepaliDigits = false } = {}) {
  const amount = Number(value || 0)
  let number = amount
  let unit = ''
  if (amount >= 10_000_000) { number = amount / 10_000_000; unit = language === 'ne' ? ' करोड' : ' Crore' }
  else if (amount >= 100_000) { number = amount / 100_000; unit = language === 'ne' ? ' लाख' : ' Lakh' }
  const prefix = language === 'ne' ? 'रु. ' : 'NPR '
  return `${prefix}${formatNumber(number, { nepaliDigits, maximumFractionDigits: unit ? 2 : 0 })}${unit}`
}

export function formatPhone(value, { nepaliDigits = false } = {}) {
  let digits = toLatinDigits(value || '').replace(/\D/g, '')
  if (digits.startsWith('00977')) digits = digits.slice(5)
  else if (digits.startsWith('977') && digits.length > 10) digits = digits.slice(3)
  let rendered = digits.length === 10 && digits.startsWith('9')
    ? `+977 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
    : value || ''
  if (nepaliDigits) rendered = toNepaliDigits(rendered)
  return rendered
}

export function formatAddress(address, { language = 'en', nepaliDigits = false } = {}) {
  if (!address) return ''
  const ward = address.ward_number || address.ward
  const parts = [address.tole, ward ? (language === 'ne' ? `वडा नं. ${ward}` : `Ward ${ward}`) : '', address.municipality || address.city, address.district, address.province]
  let rendered = parts.filter(Boolean).join(', ')
  if (rendered) rendered += language === 'ne' ? ', नेपाल' : ', Nepal'
  return nepaliDigits ? toNepaliDigits(rendered) : rendered
}
