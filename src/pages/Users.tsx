import  { useState } from 'react';
import { Search, Plus, Edit, Trash2, Shield, User, Mail, Calendar, Clock } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import UserModal from '../components/UserModal';
import {motion} from "framer-motion"
import { useLanguage } from '../contexts/LanguageContext';

function Users() {
  const { users, deleteUser, addUser, updateUser } = useData();
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const {t}= useLanguage();
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'view';
    user?: any;
  }>({ isOpen: false, mode: 'create' });

  // Rediriger si pas admin
  if (!isAdmin) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">{t('users.accessDenied')}</h2>
          <p className="text-red-600">{t('users.accessDeniedDesc')}</p>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(id);
    }
  };

  const roleColors = {
    admin: 'bg-purple-100 text-purple-800 border-purple-200',
    user: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800'
  };

  const handleModalSave = (userData: any) => {
    try {
      if (modalState.mode === 'create') {
        addUser(userData);
        alert('The new user has been created successfully');
      } else if (modalState.mode === 'edit' && modalState.user) {
        updateUser(modalState.user.id, userData);
      }
    } catch (error:any) {
      alert('An error occurred while saving'+error.toISOString);
    }
  };

  const openModal = (mode: 'create' | 'edit' | 'view', user?: any) => {
    setModalState({ isOpen: true, mode, user });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: 'create', user: undefined });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
      initial={{opacity:0, y: -30}}
      animate = {{opacity:1, y:0}}
      transition={{duration:0.8}} 
      className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('users.title')}</h1>
            <p className="text-gray-600 mt-2">{t('users.subtitle')}</p>
          </div>
          <button 
            onClick={() => openModal('create')}
            className="bg-asky-brown-600 hover:bg-asky-brown-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>{t('users.add')}</span>
          </button>
        </div>
      </motion.div>

      {/* Statistiques rapides */}
      <motion.div
      initial={{opacity:0, x: -30}}
      animate = {{opacity:1, x:0}}
      transition={{duration:0.9}}
      className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-asky-orange-100 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-asky-orange-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('users.total')}</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-asky-brown-100 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-asky-brown-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('users.admins')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('users.activeUsers')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Barre de recherche */}
      <motion.div
      initial={{opacity:0, x: 30}}
      animate = {{opacity:1, x:0}}
      transition={{duration:0.8}}
       className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="relative max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={t('users.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-asky-orange-500 focus:border-asky-orange-500"
          />
        </div>
      </motion.div>

      {/* Liste des utilisateurs */}
      <motion.div
      initial={{opacity:0, y: -30}}
      animate = {{opacity:1, y:0}}
      transition={{duration:0.8}} 
      className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {filteredUsers.length} {t('users.found')}{filteredUsers.length > 1 ? 's' : ''}
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredUsers.map((user,index) => (
            <motion.div
      initial={{opacity:0, y: -30}}
      animate = {{opacity:1, y:0}}
      transition={{duration:0.5, delay:index*0.1}}
       key={user.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    className="h-12 w-12 rounded-full object-cover"
                    src={user.avatarurl || '/avatar.jpg'}
                    alt={user.name}
                  />
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{user.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {user.email}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Créé le {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Dernière connexion: {new Date(user.lastLogin).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${roleColors[user.role]}`}>
                      {user.role === 'admin' ? t('users.admin'): t('users.user')}
                    </span>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[user.status]}`}>
                      {user.status === 'active' ? t('passengers.active') : 'Inactif'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => openModal('edit', user)}
                      className="p-2 text-gray-400 hover:text-asky-brown-600 hover:bg-asky-brown-50 rounded-lg transition-colors"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(user.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      disabled={user.id === '1'} // Empêcher la suppression de l'admin principal
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-12 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('users.nouser')}</h3>
            <p className="text-gray-600">
              {searchQuery 
                ? 'Try changing your search criteria.'
                : 'No users are registered in the system.'}
            </p>
          </div>
        )}
      </motion.div>

      <UserModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onSave={handleModalSave}
        user={modalState.user}
        mode={modalState.mode}
      />
    </div>
  );
}

export default Users;