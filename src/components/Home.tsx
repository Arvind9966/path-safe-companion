import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { MapPin, Clock, Navigation, Shield, Zap, Eye, Search, Users } from 'lucide-react';
import { ScenarioKey } from '@/data/mockData';

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
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    time: 'Now'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.from || !formData.to) {
      alert(t('error.enter_addresses'));
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit({
        from: formData.from,
        to: formData.to,
        time: formData.time
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            from: `Current Location (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`
          });
        },
        () => {
          alert(t('error.location_denied'));
        }
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-4 sm:py-8">
      {/* Hero Section */}
      <div className="glass-panel border-0 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 max-w-4xl w-full text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 title-premium tracking-tight">
          GuardianAI
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-silver mb-4 sm:mb-6 max-w-2xl mx-auto leading-relaxed px-2">
          Your intelligent safety companion for secure travel routes and real-time protection
        </p>
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-full bg-emerald/10 border border-emerald/20">
            <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-emerald" />
            <span className="text-emerald text-xs sm:text-sm font-medium">AI-Powered</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-full bg-sapphire/10 border border-sapphire/20">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-sapphire" />
            <span className="text-sapphire text-xs sm:text-sm font-medium">Real-time Safety</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded-full bg-amber/10 border border-amber/20">
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-amber" />
            <span className="text-amber text-xs sm:text-sm font-medium">Emergency Support</span>
          </div>
        </div>
      </div>

      {/* Route Analysis Form */}
      <Card className="glass-panel border-0 max-w-2xl w-full">
        <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-platinum mb-2">
            Plan Your Safe Journey
          </CardTitle>
          <CardDescription className="text-silver text-sm sm:text-base lg:text-lg px-2">
            Get AI-powered safety analysis for your route with real-time risk assessment
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="from" className="text-platinum font-medium text-sm sm:text-base">From</Label>
                <div className="relative">
                  <Input
                    id="from"
                    value={formData.from}
                    onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                    className="glass-input border-silver/20 text-platinum bg-charcoal/50 h-10 sm:h-12 text-sm sm:text-base pr-20 sm:pr-24"
                    placeholder="Starting location"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleUseLocation}
                    className="absolute right-1 top-1 h-8 sm:h-10 px-2 sm:px-3 border-emerald/20 text-emerald hover:bg-emerald/10 text-xs sm:text-sm"
                  >
                    <Navigation className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                    <span className="hidden sm:inline">GPS</span>
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="to" className="text-platinum font-medium text-sm sm:text-base">To</Label>
                <Input
                  id="to"
                  value={formData.to}
                  onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                  className="glass-input border-silver/20 text-platinum bg-charcoal/50 h-10 sm:h-12 text-sm sm:text-base"
                  placeholder="Destination"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time" className="text-platinum font-medium text-sm sm:text-base">Travel Time</Label>
              <Select value={formData.time} onValueChange={(value) => setFormData({ ...formData, time: value })}>
                <SelectTrigger className="glass-input border-silver/20 text-platinum bg-charcoal/50 h-10 sm:h-12 text-sm sm:text-base">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Now">Now</SelectItem>
                  <SelectItem value="9:00 AM">9:00 AM</SelectItem>
                  <SelectItem value="12:00 PM">12:00 PM</SelectItem>
                  <SelectItem value="3:00 PM">3:00 PM</SelectItem>
                  <SelectItem value="6:00 PM">6:00 PM</SelectItem>
                  <SelectItem value="9:00 PM">9:00 PM</SelectItem>
                  <SelectItem value="11:00 PM">11:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              type="submit" 
              className="w-full gradient-sapphire hover:scale-105 transition-all duration-300 h-11 sm:h-12 text-sm sm:text-lg font-semibold"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span className="hidden sm:inline">Analyzing Route...</span>
                  <span className="sm:hidden">Analyzing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Analyze Route Safety</span>
                  <span className="sm:hidden">Analyze Route</span>
                </div>
              )}
            </Button>
          </form>
          
          {/* Quick Demo Options */}
          <div className="pt-3 sm:pt-4 border-t border-silver/20">
            <p className="text-center text-silver text-xs sm:text-sm mb-3">
              Try these demo scenarios:
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFormData({
                    from: 'College Campus, Bandra',
                    to: 'Home, Andheri West',
                    time: '11:35 PM'
                  });
                }}
                className="border-amber/20 text-amber hover:bg-amber/10 text-xs sm:text-sm flex-1"
              >
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Late Night College
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFormData({
                    from: 'School Bus Route',
                    to: 'Pick-up Point',
                    time: '9:00 AM'
                  });
                }}
                className="border-emerald/20 text-emerald hover:bg-emerald/10 text-xs sm:text-sm flex-1"
              >
                <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Morning Commute
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;