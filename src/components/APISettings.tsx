import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Settings, Key, Database } from 'lucide-react';

interface APISettingsProps {
  onClose: () => void;
}

const APISettings = ({ onClose }: APISettingsProps) => {
  const { t } = useLanguage();
  const [apiKeys, setApiKeys] = useState({
    geminiApiKey: '',
    perplexityApiKey: '',
    mapApiKey: '',
    backendUrl: ''
  });
  
  const handleSave = () => {
    // Store API keys securely (would integrate with backend in production)
    localStorage.setItem('guardianai_api_keys', JSON.stringify(apiKeys));
    onClose();
  };
  
  const handleInputChange = (field: keyof typeof apiKeys, value: string) => {
    setApiKeys(prev => ({ ...prev, [field]: value }));
  };
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-guardian" />
          <CardTitle>API Integration Settings</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Configure API keys for live data integration. Leave blank to use demo data.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="gemini" className="flex items-center space-x-2">
              <Key className="h-4 w-4" />
              <span>Gemini API Key</span>
            </Label>
            <Input
              id="gemini"
              type="password"
              placeholder="Enter your Gemini API key for AI analysis"
              value={apiKeys.geminiApiKey}
              onChange={(e) => handleInputChange('geminiApiKey', e.target.value)}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Used for intelligent safety reasoning and chat responses
            </p>
          </div>
          
          <Separator />
          
          <div>
            <Label htmlFor="perplexity" className="flex items-center space-x-2">
              <Key className="h-4 w-4" />
              <span>Perplexity API Key</span>
            </Label>
            <Input
              id="perplexity"
              type="password"
              placeholder="Enter your Perplexity API key for real-time data"
              value={apiKeys.perplexityApiKey}
              onChange={(e) => handleInputChange('perplexityApiKey', e.target.value)}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Used for fetching current incident reports and location data
            </p>
          </div>
          
          <Separator />
          
          <div>
            <Label htmlFor="maps" className="flex items-center space-x-2">
              <Key className="h-4 w-4" />
              <span>Maps API Key</span>
            </Label>
            <Input
              id="maps"
              type="password"
              placeholder="Enter your Google Maps API key"
              value={apiKeys.mapApiKey}
              onChange={(e) => handleInputChange('mapApiKey', e.target.value)}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Used for interactive maps and route visualization
            </p>
          </div>
          
          <Separator />
          
          <div>
            <Label htmlFor="backend" className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>Backend URL</span>
            </Label>
            <Input
              id="backend"
              placeholder="https://your-backend.com/api"
              value={apiKeys.backendUrl}
              onChange={(e) => handleInputChange('backendUrl', e.target.value)}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Custom backend endpoint for safety analysis
            </p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="guardian" onClick={handleSave}>
            Save Settings
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
          <p className="font-medium mb-1">Demo Mode:</p>
          <p>
            Without API keys, GuardianAI will use built-in scenarios and mock data. 
            Perfect for demonstrations and testing the interface.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default APISettings;