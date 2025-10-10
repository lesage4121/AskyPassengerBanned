import  { useState } from 'react';
import { Shield, Calendar, Edit, Save, X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import AvatarUpload from '../components/avatarUpload';
import { useLanguage } from '../contexts/LanguageContext';
import { userService } from '../services/Api';


function Profile() {
  const { user } = useAuth();
  const { updateUser } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const {t} = useLanguage();
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [formData, setFormData] = useState({
    avatarurl: user?.avatar || '',
    name: user?.name|| '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!user) return null;
 const newErrors: Record<string, string> = {};
  const validateForm = () => {
    
    if(!formData.currentPassword) newErrors.currentpassword = 'Veuillez entrer votre mot de passe actuel';
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.newpassword = 'Les mots de passe ne correspondent pas';
    }
   if (formData.newPassword && formData.newPassword.length < 6) {
        newErrors.newpassword = 'Le mot de passe doit contenir au moins 6 caractères';
      }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAvatarChange = async (file: File) => {
    try {
      let response;
      response = await userService.uploadAvatar(parseInt(user.id), file); 
      const avatarUrl = response.avatarUrl;
      setFormData(prev => ({...prev, avatarurl: avatarUrl}))
    } catch (error) {
      alert ('Unable to update avatar');
    }
  };

  const handleSave = async () => {
      if(validateForm())
      {
        try { 
          await userService.changePassword( parseInt(user.id), formData.avatarurl,formData.currentPassword, formData.newPassword );
          setErrors({});
          alert("Modification effectuée avec succès!");
          setShowPasswordChange(false);
        } catch (passwordError: any) {
          const updatedErrors = { ...errors };
          updatedErrors.currentpassword = "le mot de passe actuel est erroné"
          setErrors(updatedErrors);
    
        }
      }
    
  };


  const handleCancel = () => {
    setFormData({
      avatarurl: user.avatar || '',
      name: user.name,
      email: user.email,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsEditing(false);
    setShowPasswordChange(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('profile.title')}</h1>
        <p className="text-gray-600 mt-2 dark:text-white">{t('profile.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">{t('profile.personalInfo')}</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 text-asky-orange-600 hover:bg-asky-orange-50 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    <span>{t('profile.edit')}</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 px-4 py-2 bg-asky-brown-600 text-white hover:bg-asky-brown-700 rounded-lg transition-colors"
                    >
                      <Save className="h-4 w-4" />
                      <span>{t('profile.save')}</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4" />
                      <span>{t('profile.cancel')}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-6">
                <AvatarUpload
                  currentAvatar={formData.avatarurl}
                  userName={user.name}
                  onAvatarChange={handleAvatarChange}
                  disabled={!isEditing}
                />
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">{t('profile.picture')}</h4>
                  <p className="text-xs text-gray-500">
                    
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('profile.fullName')}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-asky-orange-500"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{user.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('profile.email')}
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-asky-orange-500"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{user.email}</p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowPasswordChange(!showPasswordChange)}
                    className="text-asky-orange-600 hover:text-asky-orange-700 text-sm font-medium"
                  >
                    {showPasswordChange ? t('profil.mask') : t('profile.changePassword')}
                  </button>

                  {showPasswordChange && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('profile.currentPassword')}
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? 'text' : 'password'}
                            value={formData.currentPassword}
                            onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-asky-orange-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPasswords.current ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {errors.currentpassword && <p className="text-red-500 text-xs mt-1">{errors.currentpassword}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('profile.newPassword')}
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? 'text' : 'password'}
                            value={formData.newPassword}
                            onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-asky-orange-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPasswords.new ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {errors.newpassword && <p className="text-red-500 text-xs mt-1">{errors.newpassword}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('profile.confirmPassword')}
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-asky-orange-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPasswords.confirm ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                      {errors.confirmpassword && <p className="text-red-500 text-xs mt-1">{errors.confirmpassword}</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Informations du compte */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('profile.accountInfo')}</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-asky-brown-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-4 w-4 text-asky-brown-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Rôle</p>
                  <p className="text-sm text-gray-600">
                    {user.role === 'admin' ? t('users.admin') : t('users.user')}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-asky-orange-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-asky-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{t('profile.memberSince')}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-asky-orange-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-asky-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{t('users.lastLogin')}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(user.lastLogin).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

            {/*<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('profile.security')}</h3>
           <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <p className="text-sm font-medium text-gray-900">{t('profile.loginHistory')}</p>
                <p className="text-xs text-gray-600">Voir l'activité de votre compte</p>
              </button>
              <button className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <p className="text-sm font-medium text-gray-900">Sessions actives</p>
                <p className="text-xs text-gray-600">Gérer vos sessions ouvertes</p>
              </button>
            </div>
            
          </div>
          */}
        </div>
      </div>
    </div>
  );
}

export default Profile;