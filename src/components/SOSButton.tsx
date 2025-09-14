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
      variant="emergency"
      className="fixed bottom-6 right-6 w-16 h-16 rounded-full animate-pulse"
      size="sm"
    >
      <div className="flex flex-col items-center">
        <AlertTriangle className="h-6 w-6" />
        <span className="text-xs font-bold">{t('emergency.sos_button')}</span>
      </div>
    </Button>
  );
};

export default SOSButton;