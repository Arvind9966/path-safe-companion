import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Phone, MessageSquare, Navigation, ArrowLeft, MapPin, Shield } from 'lucide-react';
import { SafetyAnalysis } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import SimpleMap from './SimpleMap';
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
    if (score <= 33) return { level: 'low', label: t('risk.low'), color: 'risk-low' };
    if (score <= 66) return { level: 'medium', label: t('risk.medium'), color: 'risk-medium' };
    return { level: 'high', label: t('risk.high'), color: 'risk-high' };
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
    <div className="min-h-screen bg-gradient-space">
      {/* Back Button */}
      <div className="p-6">
        <Button
          onClick={onBack}
          className="glass-panel hover-glow border-cyber text-cyber-white backdrop-blur-xl"
          variant="outline"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
      
      <div className="flex flex-col xl:flex-row h-[calc(100vh-120px)] gap-6 px-6">
        {/* Map Section - 3D Tilted Container */}
        <div className="flex-1 relative glass-panel-cyber hover-3d p-4 min-h-[400px]">
          <div className="absolute top-4 left-4 z-20">
            <Badge className="glass-panel text-cyber-cyan border-cyber backdrop-blur-xl font-semibold">
              <MapPin className="w-3 h-3 mr-1" />
              Route Analysis
            </Badge>
          </div>
          
          <div className="map-3d w-full h-full overflow-hidden rounded-xl">
            <SimpleMap
              origin={origin}
              destination={destination}
              riskScore={currentRisk}
              showAlternateRoute={showAlternateRoute}
              className="w-full h-full"
            />
          </div>
          
          {showAlternateRoute && (
            <div className="absolute top-4 right-4 z-20">
              <Badge className="glass-panel bg-risk-low/20 text-risk-low border-risk-low backdrop-blur-xl animate-pulse">
                <Shield className="w-3 h-3 mr-1" />
                Safer Route Active
              </Badge>
            </div>
          )}
        </div>
        
        {/* Results Panel */}
        <div className="w-full xl:w-[420px] space-y-6">
          {/* Risk Assessment Card */}
          <div className="glass-panel-purple hover-3d p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-cyber opacity-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold cyber-title">Risk Assessment</h2>
                <RiskGauge3D score={currentRisk} />
              </div>
              
              <div className="space-y-4">
                <div className="glass-panel p-4 bg-white/5">
                  <p className="font-medium text-cyber-white mb-3">{analysis.short_reason}</p>
                  <ul className="space-y-2 text-sm cyber-text">
                    {analysis.detailed_reason.map((reason, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2 text-cyber-cyan">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <Button
                    onClick={handleRecommendRoute}
                    disabled={showAlternateRoute}
                    className="w-full glass-panel bg-cyber-cyan/20 hover:bg-cyber-cyan/30 border-cyber text-cyber-white hover-glow backdrop-blur-xl transition-glow font-semibold"
                  >
                    {showAlternateRoute ? 'Route Optimized' : t('result.recommend_route')}
                  </Button>
                  
                  <Button
                    onClick={onOpenChat}
                    variant="outline"
                    className="w-full glass-panel border-purple text-cyber-white hover-glow backdrop-blur-xl"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {t('result.open_chat')}
                  </Button>
                </div>
                
                {showAlternateRoute && (
                  <div className="glass-panel p-4 bg-risk-low/10 border border-risk-low rounded-xl">
                    <p className="text-sm text-risk-low font-medium">
                      {analysis.recommended_route}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Nearest Help Card */}
          <div className="glass-panel-cyber hover-3d p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-glass opacity-30"></div>
            <div className="relative">
              <h2 className="text-lg font-bold cyber-title mb-4">{t('result.nearest_help')}</h2>
              <div className="space-y-3">
                {analysis.nearest_help.map((help, index) => (
                  <div key={index} className="glass-panel p-4 bg-white/5 hover:bg-white/10 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-cyber-white">{help.name}</p>
                        <p className="text-sm cyber-text">
                          {help.distance_km} km away
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleCall(help.phone, help.name)}
                          className="glass-panel bg-cyber-cyan/20 hover:bg-cyber-cyan/30 border-cyber text-cyber-white hover-glow backdrop-blur-xl"
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          {t('result.call')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSMS(help.phone, help.name)}
                          className="glass-panel border-purple text-cyber-white hover-glow backdrop-blur-xl"
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