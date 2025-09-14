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
  
  const handleRouteSubmit = async (data: {
    from: string;
    to: string;
    time: string;
    preset?: ScenarioKey;
  }) => {
    try {
      // Call the backend analyze-route function
      const response = await fetch('https://pdirlmmavkzmqbybfdjj.supabase.co/functions/v1/analyze-route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkaXJsbW1hdmt6bXFieWJmZGpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4Mzk1MjAsImV4cCI6MjA3MzQxNTUyMH0.B4VyQxP97uUUm-2mdNZmPn3kxv8UA4rraOJAhENQ6N8`,
        },
        body: JSON.stringify({
          origin: data.from,
          destination: data.to,
          time: data.time !== 'Now' ? `2024-01-01 ${data.time}` : new Date().toISOString(),
          city: 'Mumbai', // Default city, could be made configurable
          userId: null // Will be set when auth is implemented
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze route');
      }

      const result = await response.json();
      
      // Convert backend response to match the expected SafetyAnalysis format
      const analysis: SafetyAnalysis = {
        risk_score: result.risk_score,
        short_reason: result.short_reason,
        detailed_reason: result.detailed_reason,
        recommended_route: result.recommended_route,
        nearest_help: result.nearest_help,
        chat_lines: result.chat_lines
      };
      
      setCurrentAnalysis(analysis);
      setAppState('results');
    } catch (error) {
      console.error('Error analyzing route:', error);
      
      // Fallback to mock data
      const analysis = data.preset 
        ? mockScenarios[data.preset]
        : mockScenarios.scenario_college_night;
      
      setCurrentAnalysis(analysis);
      setAppState('results');
    }
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
