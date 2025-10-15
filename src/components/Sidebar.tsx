import { X, BarChart3, Users, UserX, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const {t} = useLanguage(); 

  const menuItems = [
    { icon: BarChart3, label: t('nav.dashboard'), path: '/', adminOnly: false },
    { icon: UserX, label: t('nav.passengers'), path: '/passengers', adminOnly: false },
    { icon: Users, label: t('nav.users'), path: '/users', adminOnly: true },
    { icon: User, label: t('nav.profile'), path: '/profile', adminOnly: false },
  ];

  const filteredMenuItems = menuItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-gradient-to-r from-yellow-100 to-yellow-300 dark:bg-gradient-to-r dark:from-gray-500 dark:to-gray-600  shadow-lg
         transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-0  border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <img 
              src="/kp.png" 
              alt="ASKY Airlines" 
              className="h-14 w-auto"
            />
            <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">KP</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200
                    ${isActive 
                      ? 'bg-asky-orange-50 dark:bg-asky-orange-900/20 text-asky-brown-700 dark:text-asky-orange-400 border-r-2 border-asky-orange-600' 
                      : 'text-black dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                >
                  <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-asky-orange-900 dark:text-asky-orange-400' : 'text-black dark:text-white'}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-black dark:text-white text-center">
            © 2025 Asky <br />
            Version 1.0.0
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;