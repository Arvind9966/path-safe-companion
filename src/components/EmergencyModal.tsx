import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Phone, MessageCircle, AlertTriangle } from 'lucide-react';
import { SafetyAnalysis } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: SafetyAnalysis;
}

const EmergencyModal = ({ isOpen, onClose, analysis }: EmergencyModalProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [autoShare, setAutoShare] = useState(true);
  const [smsMessage, setSmsMessage] = useState(
    `Emergency Alert: I need assistance. My current location is being shared. Please contact me immediately. - Sent via GuardianAI`
  );
  
  const handleCallPolice = () => {
    toast({
      description: t('toast.calling') + ' Police...',
      variant: 'default'
    });
    
    setTimeout(() => {
      toast({
        description: t('toast.call_simulated'),
        variant: 'default'
      });
    }, 2000);
  };
  
  const handleSendSOS = () => {
    toast({
      description: 'SOS SMS simulated - Emergency contacts would be notified',
      variant: 'default'
    });
    onClose();
  };
  
  const handleCallHelp = (phone: string, name: string) => {
    toast({
      description: `${t('toast.calling')} ${name}...`,
    });
    
    setTimeout(() => {
      toast({
        description: t('toast.call_simulated'),
      });
    }, 2000);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-emergency">
            <AlertTriangle className="h-5 w-5 mr-2" />
            {t('emergency.title')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleCallPolice}
              variant="emergency"
            >
              <Phone className="h-4 w-4 mr-2" />
              {t('emergency.call_police')}
            </Button>
            
            <Button
              onClick={handleSendSOS}
              variant="outline"
              className="border-emergency text-emergency hover:bg-emergency hover:text-white"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              {t('emergency.send_sos')}
            </Button>
          </div>
          
          {/* Nearest Help */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">{t('result.nearest_help')}</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {analysis.nearest_help.map((help, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{help.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {help.distance_km} km • {help.phone}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleCallHelp(help.phone, help.name)}
                    variant="guardian"
                  >
                    <Phone className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Auto-share Location */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="auto-share"
              checked={autoShare}
              onCheckedChange={(checked) => setAutoShare(!!checked)}
            />
            <label htmlFor="auto-share" className="text-sm">
              {t('emergency.auto_share')}
            </label>
          </div>
          
          {/* Message Preview */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('emergency.message_preview')}
            </label>
            <Textarea
              value={smsMessage}
              onChange={(e) => setSmsMessage(e.target.value)}
              rows={3}
              className="text-xs"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSendSOS}
              variant="emergency"
            >
              Send Emergency Alert
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmergencyModal;