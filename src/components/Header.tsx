import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from './ui/button';

const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };
  
  return (
    <header className="glass-panel-cyber hover-3d p-6 m-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-cyber opacity-20"></div>
      <div className="relative flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-3xl font-bold cyber-title">
            {t('header.title')}
          </h1>
        </div>
        
        <Button
          onClick={toggleLanguage}
          variant="outline"
          size="sm"
          className="glass-panel hover-glow border-cyber text-cyber-white font-medium backdrop-blur-sm"
        >
          {t('header.toggle')}
        </Button>
      </div>
    </header>
  );
};

export default Header;