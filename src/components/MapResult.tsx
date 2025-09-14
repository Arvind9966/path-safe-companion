import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Phone, MessageSquare, Navigation, ArrowLeft, MapPin, Shield, CheckCircle } from 'lucide-react';
import { SafetyAnalysis } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import GoogleMap from './GoogleMap';
import RiskGauge3D from './RiskGauge3D';

interface MapResultProps {
  analysis: SafetyAnalysis;
  onBack: () => void;
  onOpenChat: () => void;
  origin?: string;
  destination?: string;
}

const MapResult = ({ analysis, onBack, onOpenChat, origin, destination }: MapResultProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [currentRisk, setCurrentRisk] = useState(analysis.risk_score);
  const [showAlternateRoute, setShowAlternateRoute] = useState(false);
  
  const getRiskLevel = (score: number) => {
    if (score <= 33) return { level: 'low', label: t('risk.low'), color: 'emerald' };
    if (score <= 66) return { level: 'medium', label: t('risk.medium'), color: 'amber' };
    return { level: 'high', label: t('risk.high'), color: 'crimson' };
  };
  
  const risk = getRiskLevel(currentRisk);
  
  const handleRecommendRoute = () => {
    setCurrentRisk(Math.max(currentRisk - 12, 25));
    setShowAlternateRoute(true);
    toast({
      description: t('toast.safer_route'),
    });
  };
  
  const handleCall = (phone: string, name: string) => {
    toast({
      description: `${t('toast.calling')} ${name}...`,
    });
    setTimeout(() => {
      toast({
        description: t('toast.call_simulated'),
      });
    }, 2000);
  };
  
  const handleSMS = (phone: string, name: string) => {
    toast({
      description: `SMS sent to ${name}`,
    });
  };
  
  return (
    <div className="min-h-screen bg-gradient-premium">
      {/* Back Button */}
      <div className="p-8">
        <Button
          onClick={onBack}
          className="glass-premium hover-float border-premium text-platinum backdrop-blur-xl px-6 py-3"
          variant="outline"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
      
      <div className="flex flex-col xl:flex-row h-[calc(100vh-140px)] gap-8 px-8">
        {/* Map Section - Premium 3D Container */}
        <div className="flex-1 relative glass-sapphire hover-premium p-6 min-h-[400px]">
          <div className="absolute top-6 left-6 z-20">
            <Badge className="glass-premium text-sapphire border-sapphire backdrop-blur-xl font-medium px-4 py-2">
              <MapPin className="w-4 h-4 mr-2" />
              Route Analysis
            </Badge>
          </div>
          
          <div className="map-premium w-full h-full overflow-hidden">
            <GoogleMap
              origin={origin}
              destination={destination}
              riskScore={currentRisk}
              showAlternateRoute={showAlternateRoute}
              className="w-full h-full"
            />
          </div>
          
          {showAlternateRoute && (
            <div className="absolute top-6 right-6 z-20">
              <Badge className="glass-premium bg-emerald/20 text-emerald border-emerald backdrop-blur-xl animate-float-gentle px-4 py-2">
                <CheckCircle className="w-4 h-4 mr-2" />
                Safer Route Active
              </Badge>
            </div>
          )}
        </div>
        
        {/* Results Panel */}
        <div className="w-full xl:w-[480px] space-y-8">
          {/* Risk Assessment Card */}
          <div className="glass-emerald hover-premium p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-glass opacity-20"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-semibold title-premium">Risk Assessment</h2>
                <RiskGauge3D score={currentRisk} />
              </div>
              
              <div className="space-y-6">
                <div className="glass-premium p-6 bg-white/5 rounded-2xl">
                  <p className="font-medium text-platinum mb-4 text-lg">{analysis.short_reason}</p>
                  <ul className="space-y-3 text-sm text-premium">
                    {analysis.detailed_reason.map((reason, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-3 text-sapphire font-bold">•</span>
                        <span className="leading-relaxed">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <Button
                    onClick={handleRecommendRoute}
                    disabled={showAlternateRoute}
                    className="w-full btn-sapphire py-4 text-base font-medium"
                  >
                    {showAlternateRoute ? 'Route Optimized' : t('result.recommend_route')}
                  </Button>
                  
                  <Button
                    onClick={onOpenChat}
                    variant="outline"
                    className="w-full glass-premium border-emerald text-platinum hover-float backdrop-blur-xl py-4"
                  >
                    <MessageSquare className="h-5 w-5 mr-2" />
                    {t('result.open_chat')}
                  </Button>
                </div>
                
                {showAlternateRoute && (
                  <div className="glass-premium p-6 bg-emerald/10 border border-emerald rounded-2xl">
                    <p className="text-sm text-emerald font-medium leading-relaxed">
                      {analysis.recommended_route}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Nearest Help Card */}
          <div className="glass-sapphire hover-premium p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-glass opacity-20"></div>
            <div className="relative">
              <h2 className="text-xl font-semibold title-premium mb-6">{t('result.nearest_help')}</h2>
              <div className="space-y-4">
                {analysis.nearest_help.map((help, index) => (
                  <div key={index} className="glass-premium p-6 bg-white/5 hover:bg-white/10 transition-all rounded-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-platinum text-lg">{help.name}</p>
                        <p className="text-sm text-premium mt-1">
                          {help.distance_km} km away
                        </p>
                      </div>
                      <div className="flex space-x-3">
                        <Button
                          size="sm"
                          onClick={() => handleCall(help.phone, help.name)}
                          className="btn-sapphire px-4 py-2"
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          {t('result.call')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSMS(help.phone, help.name)}
                          className="glass-premium border-emerald text-platinum hover-float backdrop-blur-xl px-4 py-2"
                        >
                          {t('result.sms')}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapResult;