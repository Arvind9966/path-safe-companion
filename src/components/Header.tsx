import { Globe, Menu, X, Users, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

interface HeaderProps {
  onShowContacts?: () => void;
}

const Header = ({ onShowContacts }: HeaderProps) => {
  const { language, setLanguage, t } = useLanguage();
  const { signOut, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="glass-premium hover-premium p-8 mx-6 mt-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-glass opacity-40 my-0 py-[10px]"></div>
      <div className="relative flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-4xl font-semibold title-premium tracking-tight">
            {t('header.title')}
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button
            className="md:hidden text-platinum hover:text-sapphire transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Desktop buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {onShowContacts && (
              <Button
                variant="outline"
                size="sm"
                onClick={onShowContacts}
                className="border-silver/20 text-silver hover:bg-silver/10"
              >
                <Users className="h-4 w-4 mr-2" />
                Emergency Contacts
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="border-silver/20 text-silver hover:bg-silver/10"
            >
              <Globe className="h-4 w-4 mr-2" />
              {language === 'en' ? 'हिंदी' : 'English'}
            </Button>
            {user && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut()}
                className="border-crimson/20 text-crimson hover:bg-crimson/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-silver/20">
          <div className="flex flex-col space-y-2">
            {onShowContacts && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onShowContacts();
                  setMobileMenuOpen(false);
                }}
                className="border-silver/20 text-silver hover:bg-silver/10 justify-start"
              >
                <Users className="h-4 w-4 mr-2" />
                Emergency Contacts
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLanguage(language === 'en' ? 'hi' : 'en');
                setMobileMenuOpen(false);
              }}
              className="border-silver/20 text-silver hover:bg-silver/10 justify-start"
            >
              <Globe className="h-4 w-4 mr-2" />
              {language === 'en' ? 'हिंदी' : 'English'}
            </Button>
            {user && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                className="border-crimson/20 text-crimson hover:bg-crimson/10 justify-start"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;