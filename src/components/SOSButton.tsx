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
      className="fixed bottom-8 right-8 w-24 h-24 btn-crimson animate-pulse-premium z-50 text-lg font-semibold"
      size="sm"
    >
      <div className="flex flex-col items-center text-white">
        <AlertTriangle className="h-10 w-10 mb-2" />
        <span className="text-sm font-bold">{t('emergency.sos_button')}</span>
      </div>
    </Button>
  );
};

export default SOSButton;