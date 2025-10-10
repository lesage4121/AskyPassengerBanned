import { useState, useRef, useEffect } from 'react';
import { Menu,  Search, LogOut, Moon, Sun,  Languages } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface NavbarProps {
  onMenuClick: () => void;
}

function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setShowLanguageMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="lg:hidden" >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center ml-4 lg:ml-0">
              <div className="flex items-center">
               {/* <img 
                  src="/image.png" 
                  alt="ASKY Airlines" 
                  className="h-8 w-auto"
                /> */}
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white transition-colors">PassBanned</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder={t('nav.search')}
                  className="w-64 pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-asky-orange-500 focus:border-asky-orange-500 transition-colors"
                />
              </div>
            </div>

            <div className="relative" ref={languageMenuRef}>
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="p-2 text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors flex items-center space-x-1"
                title={t('nav.changeLanguage')}
              >
                <Languages className="h-5 w-5" />
                <span className="text-xs font-medium">{currentLanguage?.flag}</span>
              </button>

              {/* Menu déroulant */}
              {showLanguageMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code as 'fr' | 'en');
                          setShowLanguageMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                          language === lang.code 
                            ? 'bg-asky-orange-50 dark:bg-asky-orange-900/20 text-asky-orange-700 dark:text-asky-orange-400' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span className="font-medium">{lang.name}</span>
                        {language === lang.code && (
                          <span className="ml-auto text-asky-orange-600 dark:text-asky-orange-400">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              title={isDarkMode ? (language === 'fr' ? 'Mode clair' : 'Light mode') : (language === 'fr' ? 'Mode sombre' : 'Dark mode')}
            >
              {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </button>


            <div className="flex items-center space-x-3">
              <div className="hidden md:block text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white transition-colors">{user?.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors">
                  {user?.role === 'admin' ? t('users.admin') : t('users.user')}
                </div>
              </div>
              <img
                src={user?.avatar || '/avatar.jpg'}
                alt={user?.name}
                className="h-8 w-8 rounded-full object-cover"
              />
              <button
                onClick={logout}
                className="p-2 text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                title={t('nav.logout')}
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;