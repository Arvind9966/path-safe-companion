import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Header
    'header.title': 'GuardianAI',
    'header.toggle': 'EN',
    
    // Home Screen
    'home.from.placeholder': 'From (address or use current location)',
    'home.to.placeholder': 'To (address)',
    'home.time.now': 'Now',
    'home.check_safety': 'Check Safety',
    'home.demo_presets': 'Demo presets',
    'home.preset_college': 'College → Home (11:35 PM, Bandra→Andheri)',
    'home.preset_bus': 'School Bus Pickup (9:00 AM)',
    'home.use_location': 'Use Current Location',
    
    // Risk Labels
    'risk.low': 'Low ✓',
    'risk.medium': 'Medium ⚠️',
    'risk.high': 'High ❗',
    
    // Map Result
    'result.recommend_route': 'Recommend Safer Route',
    'result.open_chat': 'Open Chat with GuardianAI',
    'result.nearest_help': 'Nearest Help',
    'result.call': 'Call',
    'result.sms': 'SMS',
    
    // Emergency
    'emergency.title': 'Emergency — Quick Actions',
    'emergency.call_police': 'Call Police',
    'emergency.send_sos': 'Send SOS SMS',
    'emergency.auto_share': 'Auto-share location',
    'emergency.message_preview': 'Message preview',
    'emergency.sos_button': 'SOS',
    
    // Chat
    'chat.ask_guardian': 'Ask Guardian',
    'chat.placeholder': 'Type your safety question...',
    
    // Toasts & Messages
    'toast.safer_route': 'Safer route applied — risk lowered by 12 points',
    'toast.calling': 'Calling',
    'toast.call_simulated': 'Call simulated',
    'error.enter_addresses': 'Please enter both source and destination.',
    'error.location_denied': 'Location access denied — use manual input.',
    
    // About
    'about.title': 'Why this matters',
    'about.predict': 'Predicts risk before incident',
    'about.scalable': 'Scalable to ride-hailing & school transport',
  },
  hi: {
    // Header
    'header.title': 'GuardianAI',
    'header.toggle': 'हिंदी',
    
    // Home Screen
    'home.from.placeholder': 'कहाँ से (पता या वर्तमान स्थान का उपयोग करें)',
    'home.to.placeholder': 'कहाँ तक (पता)',
    'home.time.now': 'अभी',
    'home.check_safety': 'सुरक्षा जांचें',
    'home.demo_presets': 'डेमो प्रीसेट',
    'home.preset_college': 'कॉलेज → घर (11:35 PM, बांद्रा→अंधेरी)',
    'home.preset_bus': 'स्कूल बस पिकअप (9:00 AM)',
    'home.use_location': 'वर्तमान स्थान का उपयोग करें',
    
    // Risk Labels
    'risk.low': 'कम ✓',
    'risk.medium': 'मध्यम ⚠️',
    'risk.high': 'उच्च ❗',
    
    // Map Result
    'result.recommend_route': 'सुरक्षित मार्ग सुझाएं',
    'result.open_chat': 'GuardianAI के साथ चैट करें',
    'result.nearest_help': 'निकटतम सहायता',
    'result.call': 'कॉल',
    'result.sms': 'SMS',
    
    // Emergency
    'emergency.title': 'आपातकाल — त्वरित कार्रवाई',
    'emergency.call_police': 'पुलिस को कॉल करें',
    'emergency.send_sos': 'SOS SMS भेजें',
    'emergency.auto_share': 'स्वचालित स्थान साझाकरण',
    'emergency.message_preview': 'संदेश पूर्वावलोकन',
    'emergency.sos_button': 'SOS',
    
    // Chat
    'chat.ask_guardian': 'Guardian से पूछें',
    'chat.placeholder': 'अपना सुरक्षा प्रश्न लिखें...',
    
    // Toasts & Messages
    'toast.safer_route': 'सुरक्षित मार्ग लागू — जोखिम 12 अंक कम हुआ',
    'toast.calling': 'कॉल कर रहे हैं',
    'toast.call_simulated': 'कॉल सिमुलेटेड',
    'error.enter_addresses': 'कृपया स्रोत और गंतव्य दोनों दर्ज करें।',
    'error.location_denied': 'स्थान पहुंच अस्वीकृत — मैन्युअल इनपुट का उपयोग करें।',
    
    // About
    'about.title': 'यह क्यों महत्वपूर्ण है',
    'about.predict': 'घटना से पहले जोखिम की भविष्यवाणी करता है',
    'about.scalable': 'राइड-हेलिंग और स्कूल ट्रांसपोर्ट के लिए स्केलेबल',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  
  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};