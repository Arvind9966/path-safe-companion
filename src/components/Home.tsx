import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MapPin, Clock, Navigation, Shield, Zap, Eye, Sparkles } from 'lucide-react';
import { ScenarioKey } from '@/data/mockData';
import heroImage from '@/assets/hero-safety-app.jpg';

interface HomeProps {
  onSubmit: (data: {
    from: string;
    to: string;
    time: string;
    preset?: ScenarioKey;
  }) => void;
}

const Home = ({ onSubmit }: HomeProps) => {
  const { t } = useLanguage();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [time, setTime] = useState('Now');
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  
  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    if (preset === 'college') {
      setFrom('College Campus, Bandra');
      setTo('Home, Andheri West');
      setTime('11:35 PM');
    } else if (preset === 'bus') {
      setFrom('School Bus Route');
      setTo('Pick-up Point');
      setTime('9:00 AM');
    }
  };
  
  const handleSubmit = () => {
    if (!from || !to) {
      alert(t('error.enter_addresses'));
      return;
    }
    
    const presetKey = selectedPreset === 'college' ? 'scenario_college_night' : 
                     selectedPreset === 'bus' ? 'scenario_bus_deviate' : undefined;
    
    onSubmit({ from, to, time, preset: presetKey as ScenarioKey });
  };
  
  const handleUseLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFrom(`Current Location (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`);
        },
        () => {
          alert(t('error.location_denied'));
        }
      );
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-premium">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto mb-12 px-8">
        <div className="bg-white/10 border border-white/20 rounded-3xl p-12 text-center backdrop-blur-xl">
          <h1 className="text-7xl font-semibold title-premium mb-6 tracking-tight">
            GuardianAI
          </h1>
          <p className="text-3xl text-premium mb-8 font-light">
            Predictive Safety Companion
          </p>
          <div className="flex items-center justify-center mt-8 space-x-8">
            <div className="flex items-center glass-premium px-6 py-3 hover-float">
              <Shield className="w-6 h-6 text-sapphire mr-3" />
              <span className="text-base text-platinum font-medium">AI-Powered</span>
            </div>
            <div className="flex items-center glass-premium px-6 py-3 hover-float">
              <Zap className="w-6 h-6 text-emerald mr-3" />
              <span className="text-base text-platinum font-medium">Real-Time</span>
            </div>
            <div className="flex items-center glass-premium px-6 py-3 hover-float">
              <Eye className="w-6 h-6 text-amber mr-3" />
              <span className="text-base text-platinum font-medium">Predictive</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto space-y-12 px-8">
        <Card className="glass-sapphire relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-glass opacity-30"></div>
          <CardHeader className="relative">
            <div className="flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-sapphire mr-3" />
            </div>
            <CardTitle className="text-center text-4xl font-semibold title-premium tracking-tight">
              Analyze Your Route Safety
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-10 relative">
            <div className="space-y-8">
              <div className="relative">
                <div className="absolute left-6 top-6 z-10">
                  <MapPin className="h-6 w-6 text-sapphire" />
                </div>
                <Input
                  placeholder={t('home.from.placeholder')}
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="pl-16 pr-40 h-16 glass-premium border-sapphire text-platinum placeholder:text-silver bg-transparent backdrop-blur-xl text-lg"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUseLocation}
                  className="absolute right-3 top-3 h-10 px-6 glass-premium border-emerald text-platinum hover-float backdrop-blur-xl"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  {t('home.use_location')}
                </Button>
              </div>
              
              <div className="relative">
                <div className="absolute left-6 top-6 z-10">
                  <MapPin className="h-6 w-6 text-emerald" />
                </div>
                <Input
                  placeholder={t('home.to.placeholder')}
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="pl-16 h-16 glass-premium border-emerald text-platinum placeholder:text-silver bg-transparent backdrop-blur-xl text-lg"
                />
              </div>
              
              <div className="relative">
                <div className="absolute left-6 top-6 z-10">
                  <Clock className="h-6 w-6 text-amber" />
                </div>
                <Input
                  placeholder={t('home.time.now')}
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="pl-16 h-16 glass-premium border-premium text-platinum placeholder:text-silver bg-transparent backdrop-blur-xl text-lg"
                />
              </div>
            </div>
            
            <div className="space-y-6">
              <label className="text-base font-medium text-premium">
                {t('home.demo_presets')}
              </label>
              <Select value={selectedPreset} onValueChange={handlePresetChange}>
                <SelectTrigger className="glass-premium border-premium text-platinum bg-transparent backdrop-blur-xl h-14 text-base">
                  <SelectValue placeholder="Choose demo scenario" />
                </SelectTrigger>
                <SelectContent className="glass-premium border-premium backdrop-blur-xl bg-onyx/90">
                  <SelectItem value="college" className="text-platinum hover:bg-sapphire/20 py-3">{t('home.preset_college')}</SelectItem>
                  <SelectItem value="bus" className="text-platinum hover:bg-sapphire/20 py-3">{t('home.preset_bus')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button
              onClick={handleSubmit}
              className="w-full text-xl py-10 btn-sapphire font-semibold tracking-wide"
              size="lg"
            >
              <Shield className="w-8 h-8 mr-4" />
              {t('home.check_safety')}
            </Button>
          </CardContent>
        </Card>
        
        {/* About Card */}
        <Card className="glass-emerald relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-glass opacity-25"></div>
          <CardHeader className="relative">
            <CardTitle className="text-2xl title-premium">{t('about.title')}</CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <ul className="space-y-4 text-premium text-base">
              <li className="flex items-start">
                <span className="text-sapphire mr-4 text-lg">•</span>
                <span className="leading-relaxed">{t('about.predict')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald mr-4 text-lg">•</span>
                <span className="leading-relaxed">{t('about.scalable')}</span>
              </li>
            </ul>
            <div className="mt-8 glass-premium p-6 bg-sapphire/10 border border-sapphire/30 rounded-2xl">
              <p className="text-sm text-premium leading-relaxed">
                🔧 <strong className="text-platinum">API Integration:</strong> GuardianAI is configured with Google Maps API for live route analysis and Places API for emergency services. Mock data is used as fallback when APIs are unavailable.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;