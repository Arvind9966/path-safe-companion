import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Phone, MessageSquare, Navigation, ArrowLeft } from 'lucide-react';
import { SafetyAnalysis } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import SimpleMap from './SimpleMap';

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
    if (score <= 33) return { level: 'low', label: t('risk.low'), color: 'risk-low', bgColor: 'risk-low-bg' };
    if (score <= 66) return { level: 'medium', label: t('risk.medium'), color: 'risk-medium', bgColor: 'risk-medium-bg' };
    return { level: 'high', label: t('risk.high'), color: 'risk-high', bgColor: 'risk-high-bg' };
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
    // Simulate call
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
    <div className="min-h-screen bg-background">
      <div className="p-4">
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
      
      <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)]">
        {/* Map Section */}
        <div className="flex-1 relative bg-muted rounded-lg mx-4 mb-4 lg:mb-0 lg:mr-2">
          <SimpleMap
            origin={origin}
            destination={destination}
            riskScore={currentRisk}
            showAlternateRoute={showAlternateRoute}
            className="w-full h-full"
          />
          {showAlternateRoute && (
            <div className="absolute top-4 right-4 z-10">
              <Badge className="bg-green-600 text-white shadow-lg">
                ✓ Safer Route Active
              </Badge>
            </div>
          )}
        </div>
        
        {/* Results Panel */}
        <div className="w-full lg:w-96 mx-4 lg:ml-2 space-y-4">
          {/* Risk Assessment Card */}
          <Card className="shadow-guardian">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Risk Assessment</CardTitle>
                <Badge
                  className={`text-2xl font-bold px-4 py-2 bg-${risk.bgColor} text-${risk.color} border-${risk.color}`}
                >
                  {currentRisk}
                </Badge>
              </div>
              <Badge
                variant="secondary"
                className={`w-fit bg-${risk.bgColor} text-${risk.color}`}
              >
                {risk.label}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium mb-2">{analysis.short_reason}</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {analysis.detailed_reason.map((reason, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="space-y-2">
                <Button
                  onClick={handleRecommendRoute}
                  variant="guardian"
                  className="w-full"
                  disabled={showAlternateRoute}
                >
                  {t('result.recommend_route')}
                </Button>
                
                <Button
                  onClick={onOpenChat}
                  variant="outline"
                  className="w-full"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {t('result.open_chat')}
                </Button>
              </div>
              
              {showAlternateRoute && (
                <div className="p-3 bg-risk-low-bg rounded-lg border border-risk-low">
                  <p className="text-sm text-risk-low font-medium">
                    {analysis.recommended_route}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Nearest Help Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('result.nearest_help')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.nearest_help.map((help, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{help.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {help.distance_km} km away
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleCall(help.phone, help.name)}
                        variant="guardian"
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        {t('result.call')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSMS(help.phone, help.name)}
                      >
                        {t('result.sms')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MapResult;