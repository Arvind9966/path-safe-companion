import { useState } from 'react';
import Header from '@/components/Header';
import Home from '@/components/Home';
import MapResult from '@/components/MapResult';
import ChatPanel from '@/components/ChatPanel';
import EmergencyModal from '@/components/EmergencyModal';
import SOSButton from '@/components/SOSButton';
import { mockScenarios, SafetyAnalysis, ScenarioKey } from '@/data/mockData';

type AppState = 'home' | 'results';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('home');
  const [currentAnalysis, setCurrentAnalysis] = useState<SafetyAnalysis | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  
  const handleRouteSubmit = (data: {
    from: string;
    to: string;
    time: string;
    preset?: ScenarioKey;
  }) => {
    // Use preset scenario if available, otherwise default to college scenario
    const analysis = data.preset 
      ? mockScenarios[data.preset]
      : mockScenarios.scenario_college_night;
    
    setCurrentAnalysis(analysis);
    setAppState('results');
  };
  
  const handleBack = () => {
    setAppState('home');
    setIsChatOpen(false);
  };
  
  const handleOpenChat = () => {
    setIsChatOpen(true);
  };
  
  const handleCloseChat = () => {
    setIsChatOpen(false);
  };
  
  const handleEmergencyOpen = () => {
    setIsEmergencyOpen(true);
  };
  
  const handleEmergencyClose = () => {
    setIsEmergencyOpen(false);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {appState === 'home' && (
        <Home onSubmit={handleRouteSubmit} />
      )}
      
      {appState === 'results' && currentAnalysis && (
        <div className="flex">
          <div className={`flex-1 ${isChatOpen ? 'lg:pr-96' : ''}`}>
            <MapResult
              analysis={currentAnalysis}
              onBack={handleBack}
              onOpenChat={handleOpenChat}
            />
          </div>
          
          <ChatPanel
            isOpen={isChatOpen}
            onClose={handleCloseChat}
            analysis={currentAnalysis}
          />
        </div>
      )}
      
      <SOSButton onClick={handleEmergencyOpen} />
      
      {currentAnalysis && (
        <EmergencyModal
          isOpen={isEmergencyOpen}
          onClose={handleEmergencyClose}
          analysis={currentAnalysis}
        />
      )}
    </div>
  );
};

export default Index;
