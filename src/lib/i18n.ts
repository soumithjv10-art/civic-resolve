export type SupportedLanguage = "en" | "ta" | "hi";

export interface TranslationDictionary {
  // Navigation
  navFeed: string;
  navMap: string;
  navAccountability: string;
  navAdmin: string;
  navReportBtn: string;
  portalSubtitle: string;
  helpline: string;
  liveGrid: string;

  // Hero
  heroTitle: string;
  heroSubtitle: string;
  reportIssueBtn: string;
  exploreMapBtn: string;
  trackPlaceholder: string;
  trackBtn: string;

  // Filters & Headers
  feedTitle: string;
  feedCountPrefix: string;
  feedCountSuffix: string;
  searchPlaceholder: string;
  allCategories: string;
  allPriorities: string;
  allStatuses: string;
  resetFilters: string;

  // Report Form
  reportHeaderTitle: string;
  reportHeaderSubtitle: string;
  complaintTitleLabel: string;
  complaintTitlePlaceholder: string;
  categoryLabel: string;
  categoryAuto: string;
  locationLabel: string;
  locationPlaceholder: string;
  useMyLocation: string;
  detectingLocation: string;
  locationDetected: string;
  voiceReportBtn: string;
  aiAutoDescBadge: string;
  aiAutoDescNotice: string;
  attachPhotoLabel: string;
  photoDropHint: string;
  submitGrievanceBtn: string;
  submittingText: string;

  // Status & Priority
  statusReported: string;
  statusInProgress: string;
  statusAwaitingVerification: string;
  statusResolved: string;
  statusReopened: string;
  priorityCritical: string;
  priorityHigh: string;
  priorityMedium: string;
  priorityLow: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    navFeed: "Complaints Feed",
    navMap: "Civic Map",
    navAccountability: "Accountability",
    navAdmin: "Admin Queue",
    navReportBtn: "Report an Issue",
    portalSubtitle: "Municipal Grievance Intelligence & Accountability",
    helpline: "Civic Helpline: 1913",
    liveGrid: "Triage Online",

    heroTitle: "Better Cities Begin With Better Accountability.",
    heroSubtitle: "Direct municipal grievance redressal, real-time tracking, and verified civic repairs.",
    reportIssueBtn: "Report an Issue",
    exploreMapBtn: "Explore Civic Map",
    trackPlaceholder: "Track ID e.g. CIVIC-2026-10492...",
    trackBtn: "Track",

    feedTitle: "Public Municipal Feed",
    feedCountPrefix: "Showing",
    feedCountSuffix: "active civic issues under public audit",
    searchPlaceholder: "Search by title, street, or ID...",
    allCategories: "All Categories",
    allPriorities: "All Priorities",
    allStatuses: "All Statuses",
    resetFilters: "Reset Filters",

    reportHeaderTitle: "Report a Civic Grievance",
    reportHeaderSubtitle: "Submit infrastructure and municipal defects. AI automatically inspects severity, routes to engineers, and generates technical work orders.",
    complaintTitleLabel: "Defect / Problem Title *",
    complaintTitlePlaceholder: "e.g. Hazardous exposed 440V cable dangling near Anna Nagar school",
    categoryLabel: "Category (Optional — AI Auto-Detects)",
    categoryAuto: "Let AI categorize automatically",
    locationLabel: "Location / Landmark *",
    locationPlaceholder: "e.g. 2nd Avenue, Opp. Canara Bank, Anna Nagar West",
    useMyLocation: "Use My GPS Location",
    detectingLocation: "Pinpointing GPS...",
    locationDetected: "GPS Location Detected",
    voiceReportBtn: "Report by Voice (Tamil / English)",
    aiAutoDescBadge: "Automated AI Defect Diagnosis",
    aiAutoDescNotice: "You do not need to type a description. Our municipal AI automatically compiles technical engineering notes, risk level, and repair orders from your title and photograph.",
    attachPhotoLabel: "Attach Photograph Evidence (Optional)",
    photoDropHint: "Click to upload a photograph or drag and drop (JPEG, PNG, WebP)",
    submitGrievanceBtn: "Submit Grievance to Municipal Grid",
    submittingText: "Submitting & Analyzing...",

    statusReported: "Reported",
    statusInProgress: "In Progress",
    statusAwaitingVerification: "Awaiting Verification",
    statusResolved: "Resolved",
    statusReopened: "Reopened",
    priorityCritical: "Critical",
    priorityHigh: "High",
    priorityMedium: "Medium",
    priorityLow: "Low",
  },
  ta: {
    navFeed: "புகார்கள் பட்டியல்",
    navMap: "நகர வரைபடம்",
    navAccountability: "பொறுப்புத்தன்மை",
    navAdmin: "நிர்வாகக் குழு",
    navReportBtn: "புகார் பதிவு செய்க",
    portalSubtitle: "நகராட்சி குறைதீர்ப்பு நுண்ணறிவு தளம்",
    helpline: "உதவி எண்: 1913",
    liveGrid: "நேரலை கண்காணிப்பு",

    heroTitle: "தூய்மையான நகரங்கள் பொறுப்புடைமையுடன் தொடங்குகின்றன.",
    heroSubtitle: "நகராட்சி பிரச்சனைகளை விரைவாக தீர்க்கும் செயற்கை நுண்ணறிவு தளம்.",
    reportIssueBtn: "புகார் பதிவு செய்க",
    exploreMapBtn: "வரைபடம் காண்க",
    trackPlaceholder: "புகார் எண் e.g. CIVIC-2026-10492...",
    trackBtn: "தேடு",

    feedTitle: "பொது நகராட்சி புகார்கள்",
    feedCountPrefix: "மொத்தம்",
    feedCountSuffix: "செயலில் உள்ள புகார்கள் பொது ஆய்வில் உள்ளன",
    searchPlaceholder: "தலைப்பு, தெரு அல்லது எண் கொண்டு தேடுக...",
    allCategories: "அனைத்து பிரிவுகள்",
    allPriorities: "அனைத்து நிலைகள்",
    allStatuses: "அனைத்து நிலைகள்",
    resetFilters: "வடிகட்டிகளை மீட்டமை",

    reportHeaderTitle: "நகராட்சி குறை பதிவு படிவம்",
    reportHeaderSubtitle: "பொது உள்கட்டமைப்பு குறைபாடுகளை பதிவு செய்யுங்கள். AI தானாகவே ஆய்வு செய்து அதிகாரிகளுக்கு அனுப்புகிறது.",
    complaintTitleLabel: "குறைபாடு / பிரச்சனையின் தலைப்பு *",
    complaintTitlePlaceholder: "எ.கா. அண்ணா நகர் பள்ளி அருகில் உடைந்த மின்கம்பி தொங்குகிறது",
    categoryLabel: "பிரிவு (விருப்பத்திற்குரியது)",
    categoryAuto: "AI தானாக தேர்வு செய்யட்டும்",
    locationLabel: "இடம் / அடையாளம் *",
    locationPlaceholder: "எ.கா. 2-வது அவென்யூ, அண்ணா நகர் மேற்கு",
    useMyLocation: "என் இருப்பிடத்தை கண்டறி",
    detectingLocation: "இருப்பிடம் கண்டறியப்படுகிறது...",
    locationDetected: "இருப்பிடம் பெறப்பட்டது",
    voiceReportBtn: "குரல் மூலம் பதிவு செய்க (தமிழ் / ஆங்கிலம்)",
    aiAutoDescBadge: "தானியங்கி AI தொழில்நுட்ப விளக்கம்",
    aiAutoDescNotice: "நீங்கள் விளக்கம் தட்டச்சு செய்ய வேண்டியதில்லை. உங்கள் தலைப்பு மற்றும் புகைப்படத்தில் இருந்து AI விரிவான தொழில்நுட்ப குறிப்பை தானாகவே உருவாக்கும்.",
    attachPhotoLabel: "புகைப்பட சான்று இணைக்க (விரும்பினால்)",
    photoDropHint: "புகைப்படத்தை பதிவேற்ற கிளிக் செய்யவும் (JPEG, PNG, WebP)",
    submitGrievanceBtn: "புகாரை உடனடியாக சமர்ப்பிக்கவும்",
    submittingText: "சமர்ப்பிக்கப்படுகிறது...",

    statusReported: "பதிவு செய்யப்பட்டது",
    statusInProgress: "செயலில் உள்ளது",
    statusAwaitingVerification: "சரிபார்ப்பில் உள்ளது",
    statusResolved: "தீர்க்கப்பட்டது",
    statusReopened: "மீண்டும் திறக்கப்பட்டது",
    priorityCritical: "அவசரம்",
    priorityHigh: "முக்கியம்",
    priorityMedium: "நடுத்தரம்",
    priorityLow: "குறைந்தது",
  },
  hi: {
    navFeed: "शिकायतें सूची",
    navMap: "नागरिक मानचित्र",
    navAccountability: "जवाबदेही",
    navAdmin: "प्रशासनिक कतार",
    navReportBtn: "शिकायत दर्ज करें",
    portalSubtitle: "नगर निगम शिकायत बुद्धिमत्ता व जवाबदेही मंच",
    helpline: "हेल्पलाइन: 1913",
    liveGrid: "लाइव निगरानी",

    heroTitle: "बेहतर शहर, बेहतर जवाबदेही से बनते हैं।",
    heroSubtitle: "नगर निगम समस्याओं का त्वरित निवारण और वास्तविक समय में समाधान।",
    reportIssueBtn: "शिकायत दर्ज करें",
    exploreMapBtn: "मानचित्र देखें",
    trackPlaceholder: "शिकायत संख्या दर्ज करें...",
    trackBtn: "ट्रैक करें",

    feedTitle: "सार्वजनिक नगर निगम शिकायतें",
    feedCountPrefix: "कुल",
    feedCountSuffix: "सक्रिय शिकायतें सार्वजनिक निरीक्षण में हैं",
    searchPlaceholder: "शीर्षक, सड़क या आईडी से खोजें...",
    allCategories: "सभी श्रेणियां",
    allPriorities: "सभी प्राथमिकताएं",
    allStatuses: "सभी स्थितियां",
    resetFilters: "फ़िल्टर रीसेट करें",

    reportHeaderTitle: "नागरिक शिकायत दर्ज करें",
    reportHeaderSubtitle: "सार्वजनिक बुनियादी ढांचे की समस्याओं की रिपोर्ट करें। एआई तुरंत विश्लेषण कर संबंधित विभाग को भेजता है।",
    complaintTitleLabel: "समस्या का शीर्षक *",
    complaintTitlePlaceholder: "उदा. मुख्य सड़क पर खुला बिजली का तार या गहरा गड्ढा",
    categoryLabel: "श्रेणी (वैकल्पिक)",
    categoryAuto: "एआई स्वचालित रूप से श्रेणीबद्ध करे",
    locationLabel: "स्थान / लैंडमार्क *",
    locationPlaceholder: "उदा. गांधी रोड, बस स्टॉप के पास",
    useMyLocation: "मेरा जीपीएस स्थान खोजें",
    detectingLocation: "स्थान खोजा जा रहा है...",
    locationDetected: "जीपीएस स्थान मिल गया",
    voiceReportBtn: "आवाज़ से रिपोर्ट करें",
    aiAutoDescBadge: "स्वचालित एआई तकनीकी विवरण",
    aiAutoDescNotice: "आपको विवरण टाइप करने की आवश्यकता नहीं है। हमारे नगर निगम एआई द्वारा आपके शीर्षक और फोटो से विस्तृत इंजीनियरिंग विवरण तैयार किया जाता है।",
    attachPhotoLabel: "फोटो साक्ष्य संलग्न करें (वैकल्पिक)",
    photoDropHint: "फोटो अपलोड करने के लिए क्लिक करें (JPEG, PNG, WebP)",
    submitGrievanceBtn: "शिकायत तुरंत दर्ज करें",
    submittingText: "दर्ज की जा रही है...",

    statusReported: "दर्ज की गई",
    statusInProgress: "प्रगति पर",
    statusAwaitingVerification: "सत्यापन लंबित",
    statusResolved: "समाधान हुआ",
    statusReopened: "पुनः खोली गई",
    priorityCritical: "अति आवश्यक",
    priorityHigh: "उच्च",
    priorityMedium: "मध्यम",
    priorityLow: "सामान्य",
  },
};
