import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MapPin, Clock, Navigation } from 'lucide-react';
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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-64 mb-8 overflow-hidden">
        <img
          src={heroImage}
          alt="GuardianAI Safety Technology"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-guardian/80 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-2">GuardianAI</h1>
            <p className="text-xl">Predictive Safety Companion</p>
          </div>
        </div>
      </div>
      
      <div className="max-w-2xl mx-auto space-y-6 px-4">
        <Card className="shadow-guardian">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">
              Analyze Your Route Safety
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('home.from.placeholder')}
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="pl-10"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUseLocation}
                  className="absolute right-2 top-2 h-7 px-2 text-xs"
                >
                  <Navigation className="h-3 w-3 mr-1" />
                  {t('home.use_location')}
                </Button>
              </div>
              
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('home.to.placeholder')}
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('home.time.now')}
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {t('home.demo_presets')}
              </label>
              <Select value={selectedPreset} onValueChange={handlePresetChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose demo scenario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="college">{t('home.preset_college')}</SelectItem>
                  <SelectItem value="bus">{t('home.preset_bus')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button
              onClick={handleSubmit}
              variant="guardian"
              className="w-full text-lg py-6"
              size="lg"
            >
              {t('home.check_safety')}
            </Button>
          </CardContent>
        </Card>
        
        {/* About Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('about.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• {t('about.predict')}</li>
              <li>• {t('about.scalable')}</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;