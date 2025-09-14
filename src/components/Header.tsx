import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from './ui/button';

const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };
  
  return (
    <header className="glass-premium hover-premium p-8 mx-6 mt-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-glass opacity-40"></div>
      <div className="relative flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-4xl font-semibold title-premium tracking-tight">
            {t('header.title')}
          </h1>
        </div>
        
        <Button
          onClick={toggleLanguage}
          variant="outline"
          size="sm"
          className="glass-premium hover-float border-sapphire text-platinum font-medium backdrop-blur-xl px-6 py-2"
        >
          {t('header.toggle')}
        </Button>
      </div>
    </header>
  );
};

export default Header;