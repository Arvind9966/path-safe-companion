import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from './ui/button';
import { AlertTriangle } from 'lucide-react';

interface SOSButtonProps {
  onClick: () => void;
}

const SOSButton = ({ onClick }: SOSButtonProps) => {
  const { t } = useLanguage();
  
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-20 h-20 rounded-full glass-panel pulse-emergency hover-3d bg-emergency/20 border-2 border-emergency backdrop-blur-xl z-50"
      size="sm"
    >
      <div className="flex flex-col items-center text-cyber-white">
        <AlertTriangle className="h-8 w-8 mb-1" />
        <span className="text-xs font-bold">{t('emergency.sos_button')}</span>
      </div>
    </Button>
  );
};

export default SOSButton;