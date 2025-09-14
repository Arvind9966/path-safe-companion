import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MapPin, Clock, Navigation, Shield, Zap, Eye } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-space">
      {/* Hero Section */}
      <div className="relative h-80 mb-8 overflow-hidden">
        <img
          src={heroImage}
          alt="GuardianAI Safety Technology"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-space/90 flex items-center justify-center">
          <div className="text-center relative">
            <div className="absolute inset-0 bg-cyber-cyan/20 blur-3xl rounded-full"></div>
            <h1 className="text-6xl font-bold cyber-title mb-4 relative z-10">GuardianAI</h1>
            <p className="text-2xl cyber-text relative z-10">Predictive Safety Companion</p>
            <div className="flex items-center justify-center mt-6 space-x-6">
              <div className="flex items-center glass-panel px-4 py-2 hover-glow">
                <Shield className="w-5 h-5 text-cyber-cyan mr-2" />
                <span className="text-sm text-cyber-white">AI-Powered</span>
              </div>
              <div className="flex items-center glass-panel px-4 py-2 hover-glow">
                <Zap className="w-5 h-5 text-cyber-purple-accent mr-2" />
                <span className="text-sm text-cyber-white">Real-Time</span>
              </div>
              <div className="flex items-center glass-panel px-4 py-2 hover-glow">
                <Eye className="w-5 h-5 text-risk-low mr-2" />
                <span className="text-sm text-cyber-white">Predictive</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-3xl mx-auto space-y-8 px-6">
        <Card className="glass-panel-cyber relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-cyber opacity-10"></div>
          <CardHeader className="relative">
            <CardTitle className="text-center text-3xl font-bold cyber-title">
              Analyze Your Route Safety
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 relative">
            <div className="space-y-6">
              <div className="relative">
                <div className="absolute left-4 top-4 z-10">
                  <MapPin className="h-5 w-5 text-cyber-cyan" />
                </div>
                <Input
                  placeholder={t('home.from.placeholder')}
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="pl-12 pr-32 h-14 glass-panel border-cyber text-cyber-white placeholder:text-cyber-gray bg-transparent backdrop-blur-xl"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUseLocation}
                  className="absolute right-2 top-2 h-10 px-4 glass-panel border-purple text-cyber-white hover-glow backdrop-blur-xl"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  {t('home.use_location')}
                </Button>
              </div>
              
              <div className="relative">
                <div className="absolute left-4 top-4 z-10">
                  <MapPin className="h-5 w-5 text-cyber-purple-accent" />
                </div>
                <Input
                  placeholder={t('home.to.placeholder')}
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="pl-12 h-14 glass-panel border-purple text-cyber-white placeholder:text-cyber-gray bg-transparent backdrop-blur-xl"
                />
              </div>
              
              <div className="relative">
                <div className="absolute left-4 top-4 z-10">
                  <Clock className="h-5 w-5 text-risk-medium" />
                </div>
                <Input
                  placeholder={t('home.time.now')}
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="pl-12 h-14 glass-panel border-cyber text-cyber-white placeholder:text-cyber-gray bg-transparent backdrop-blur-xl"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <label className="text-sm font-medium cyber-text">
                {t('home.demo_presets')}
              </label>
              <Select value={selectedPreset} onValueChange={handlePresetChange}>
                <SelectTrigger className="glass-panel border-cyber text-cyber-white bg-transparent backdrop-blur-xl h-12">
                  <SelectValue placeholder="Choose demo scenario" />
                </SelectTrigger>
                <SelectContent className="glass-panel border-cyber backdrop-blur-xl bg-cyber-navy/90">
                  <SelectItem value="college" className="text-cyber-white hover:bg-cyber-cyan/20">{t('home.preset_college')}</SelectItem>
                  <SelectItem value="bus" className="text-cyber-white hover:bg-cyber-cyan/20">{t('home.preset_bus')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button
              onClick={handleSubmit}
              className="w-full text-lg py-8 glass-panel bg-gradient-cyber border-cyber hover-glow backdrop-blur-xl font-bold text-cyber-white transition-glow"
              size="lg"
            >
              <Shield className="w-6 h-6 mr-3" />
              {t('home.check_safety')}
            </Button>
          </CardContent>
        </Card>
        
        {/* About Card */}
        <Card className="glass-panel-purple relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-glass opacity-20"></div>
          <CardHeader className="relative">
            <CardTitle className="text-xl cyber-title">{t('about.title')}</CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <ul className="space-y-3 text-cyber-gray">
              <li className="flex items-start">
                <span className="text-cyber-cyan mr-3">•</span>
                {t('about.predict')}
              </li>
              <li className="flex items-start">
                <span className="text-cyber-purple-accent mr-3">•</span>
                {t('about.scalable')}
              </li>
            </ul>
            <div className="mt-6 glass-panel p-4 bg-cyber-cyan/10 border border-cyber-cyan/30 rounded-xl">
              <p className="text-xs cyber-text">
                🔧 <strong className="text-cyber-white">API Integration:</strong> GuardianAI is configured with Google Maps API for live route analysis and Places API for emergency services. Mock data is used as fallback when APIs are unavailable.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;