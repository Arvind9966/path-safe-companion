import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { PlayCircle, Clock, Shield, Smartphone } from 'lucide-react';

const DemoInstructions = () => {
  const { t, language } = useLanguage();
  
  const scenarios = [
    {
      title: language === 'en' ? 'Scenario A: College → Home (Night)' : 'परिदृश्य A: कॉलेज → घर (रात)',
      steps: language === 'en' ? [
        '1. Select preset "College → Home (11:35 PM)"',
        '2. Click "Check Safety" → Risk 78 (High)',
        '3. Click "Recommend Safer Route" → Risk drops to 66',
        '4. Click SOS → Emergency contacts shown',
        '5. Simulate call to police'
      ] : [
        '1. प्रीसेट "कॉलेज → घर (11:35 PM)" चुनें',
        '2. "सुरक्षा जांचें" पर क्लिक करें → रिस्क 78 (उच्च)',
        '3. "सुरक्षित मार्ग सुझाएं" पर क्लिक करें → रिस्क 66 तक गिरता है',
        '4. SOS पर क्लिक करें → आपातकालीन संपर्क दिखाए गए',
        '5. पुलिस को कॉल सिमुलेट करें'
      ],
      icon: Clock,
      time: '90s'
    },
    {
      title: language === 'en' ? 'Scenario B: School Bus Deviation' : 'परिदृश्य B: स्कूल बस विचलन',
      steps: language === 'en' ? [
        '1. Select "School Bus Pickup" preset',
        '2. Show "Bus deviated" alert',
        '3. Risk 45 (Medium) with ETA increase',
        '4. Click "Send Alert to Parent"',
        '5. Preview SMS notification'
      ] : [
        '1. "स्कूल बस पिकअप" प्रीसेट चुनें',
        '2. "बस विचलित" अलर्ट दिखाएं',
        '3. रिस्क 45 (मध्यम) ETA वृद्धि के साथ',
        '4. "पेरेंट को अलर्ट भेजें" पर क्लिक करें',
        '5. SMS अधिसूचना पूर्वावलोकन'
      ],
      icon: Smartphone,
      time: '60s'
    }
  ];
  
  const features = language === 'en' ? [
    'AI-powered risk assessment',
    'Bilingual support (EN/Hindi)', 
    'Emergency SOS functionality',
    'Real-time route optimization',
    'Mock data for demo reliability'
  ] : [
    'AI-संचालित जोखिम मूल्यांकन',
    'द्विभाषी समर्थन (EN/हिंदी)',
    'आपातकालीन SOS कार्यक्षमता',
    'वास्तविक समय मार्ग अनुकूलन',
    'डेमो विश्वसनीयता के लिए मॉक डेटा'
  ];
  
  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      <Card className="border-guardian border-2">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <PlayCircle className="h-6 w-6 text-guardian" />
            <CardTitle className="text-xl">
              {language === 'en' ? 'Demo Instructions for Judges' : 'न्यायाधीशों के लिए डेमो निर्देश'}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {scenarios.map((scenario, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center space-x-2">
                  <scenario.icon className="h-5 w-5 text-guardian" />
                  <h3 className="font-semibold">{scenario.title}</h3>
                  <Badge variant="outline" className="ml-auto">
                    {scenario.time}
                  </Badge>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {scenario.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="pl-4">{step}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-guardian" />
            <CardTitle>
              {language === 'en' ? 'Key Features' : 'मुख्य विशेषताएं'}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
            {features.map((feature, index) => (
              <Badge key={index} variant="secondary" className="justify-start p-2">
                {feature}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemoInstructions;