import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from './ui/button';

const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };
  
  return (
    <header className="flex items-center justify-between p-4 bg-gradient-guardian shadow-guardian">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-primary-foreground">
          {t('header.title')}
        </h1>
      </div>
      
      <Button
        onClick={toggleLanguage}
        variant="secondary"
        size="sm"
        className="text-sm font-medium"
      >
        {t('header.toggle')}
      </Button>
    </header>
  );
};

export default Header;