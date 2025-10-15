import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, AlertTriangle, } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import { BannedPassenger } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';

interface PassengerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (passenger: Omit<BannedPassenger, 'id' | 'createdBy' | 'lastModified'>) => void;
  passenger?: BannedPassenger;
  mode: 'create' | 'edit' | 'view';
}

function PassengerModal({ isOpen, onClose, onSave, passenger, mode }: PassengerModalProps) {
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    passportNumber: '',
    nationality: '',
    dateOfBirth: '',
    banReason: '',
    banDate: new Date().toISOString().split('T')[0],
    banDuration: 'TEMPORARY' as 'PERMANENT' | 'TEMPORARY',
    banEndDate: '',
    severity: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    notes: '',
    status: 'ACTIVE' as 'ACTIVE' | 'EXPIRED' | 'UNDER_REVIEW',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const options = useMemo(() => countryList().getData(), []);

  useEffect(() => {
    if (passenger && (mode === 'edit' || mode === 'view')) {
      setFormData({
        firstName: passenger.firstName,
        lastName: passenger.lastName,
        email: passenger.email,
        phone: passenger.phone,
        passportNumber: passenger.passportNumber,
        nationality: passenger.nationality,
        dateOfBirth: passenger.dateOfBirth,
        banReason: passenger.banReason,
        banDate: passenger.banDate,
        banDuration: passenger.banDuration,
        banEndDate: passenger.banEndDate || '',
        severity: passenger.severity,
        notes: passenger.notes,
        status: passenger.status,
      });
    } else if (mode === 'create') {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        passportNumber: '',
        nationality: '',
        dateOfBirth: '',
        banReason: '',
        banDate: new Date().toISOString().split('T')[0],
        banDuration: 'TEMPORARY',
        banEndDate: '',
        severity: 'MEDIUM',
        notes: '',
        status: 'ACTIVE',
      });
      setErrors({});
    }
    
  }, [passenger, mode, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = t('passengers.requestprenom');
    if (!formData.lastName.trim()) newErrors.lastName = t('passengers.requestname');
    if (!formData.email.trim()) newErrors.email = t('passengers.requestemailformat');
    if (!formData.passportNumber.trim()) newErrors.passportNumber = t('passengers.rquestpassport');
    if (!formData.dateOfBirth) newErrors.dateOfBirth = t('passengers.requestdatebeth');
    if (!formData.banReason.trim()) newErrors.banReason = t('passengers.requestbanraison');
    if (!formData.banDate) newErrors.banDate = t('passengers.requestdateban');
    if (!formData.nationality.trim()) newErrors.nationality = t('passengers.requestnationality');
    if (formData.banDuration === 'TEMPORARY' && !formData.banEndDate)
      newErrors.banEndDate = t('passengers.requestendban');
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = t('passengers.requestemailformat');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
      handleClose();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  if (!isOpen) return null;

   const handleClose = () => {
  setErrors({});
  onClose();
};

  const isReadOnly = mode === 'view';
  const title =
    mode === 'create'
      ? t('passengers.titleaddpassenger')
      : mode === 'edit'
      ? t('passengers.titlemodifierpassenger')
      : t('passengers.titlepassengerdetails');

  return (
    <AnimatePresence>
    <motion.div
    key="passenger-modal"
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-200 
             dark:from-[#1f1b16] dark:via-[#2a231a] dark:to-[#3a2f20]
             rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] 
             overflow-y-auto border-2 border-asky-orange-500">
        {/* Header */}
         <div className="flex items-center justify-between p-6 border-b border-amber-300 dark:border-asky-brown-700 bg-amber-50/60 dark:bg-[#2b211a] rounded-t-2xl">
          <h2 className="text-2xl font-bold text-asky-brown-700 dark:text-asky-orange-400 tracking-wide">
      {title}
    </h2>
          <button
             onClick={() => {handleClose();}}
             className="p-2 hover:bg-amber-200 dark:hover:bg-asky-brown-800 rounded-full transition-colors"
          >
             <X className="h-6 w-6 text-asky-orange-500 dark:text-asky-orange-400" />
           </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.prenom')} *</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={e => handleInputChange('firstName', e.target.value)}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-asky-orange-500 ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.name')} *</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={e => handleInputChange('lastName', e.target.value)}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-asky-orange-500 ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.email')} *</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-asky-orange-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.phone')} *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => handleInputChange('phone', e.target.value)}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-asky-orange-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('passengers.passnumder')} *</label>
              <input
                type="text"
                value={formData.passportNumber}
                onChange={e => handleInputChange('passportNumber', e.target.value)}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-asky-orange-500 ${
                  errors.passportNumber ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.passportNumber && <p className="text-red-500 text-xs mt-1">{errors.passportNumber}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('passengers.nationality')} *</label>
              <Select
                options={options}
                value={options.find(opt => opt.label === formData.nationality)}
                onChange={(val: any) => handleInputChange('nationality', val.label)}
                isDisabled={isReadOnly}
                classNamePrefix={errors.nationality ? 'react-select-error' : 'react-select'}
              />
              {errors.nationality && <p className="text-red-500 text-xs mt-1">{errors.nationality}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('passengers.datebith')} *</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={e => handleInputChange('dateOfBirth', e.target.value)}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-asky-orange-500 ${
                  errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
            </div>
          </div>

          {/* Ban Info */}
          <div className="space-y-4 border-t border-gray-200 pt-4">
            <h3 className="text-xl font-semibold text-asky-brown-600 flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2 text-asky-orange-500" />
              {t('passengers.infoban')}
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('passengers.banraison')} *</label>
              <textarea
                value={formData.banReason}
                onChange={e => handleInputChange('banReason', e.target.value)}
                rows={3}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-asky-orange-500 ${
                  errors.banReason ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.banReason && <p className="text-red-500 text-xs mt-1">{errors.banReason}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('passengers.dateban')} *</label>
                <input
                  type="date"
                  value={formData.banDate}
                  onChange={e => handleInputChange('banDate', e.target.value)}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-asky-orange-500 ${
                    errors.banDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.banDate && <p className="text-red-500 text-xs mt-1">{errors.banDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('passengers.banDuration')} *</label>
                <select
                  value={formData.banDuration}
                  onChange={e => handleInputChange('banDuration', e.target.value)}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-asky-orange-500"
                >
                  <option value="TEMPORARY">{t('passengers.temporary')}</option>
                  <option value="PERMANENT">{t('passengers.permanent')}</option>
                </select>
              </div>

              {formData.banDuration === 'TEMPORARY' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('passengers.datefinban')} *</label>
                  <input
                    type="date"
                    value={formData.banEndDate}
                    onChange={e => handleInputChange('banEndDate', e.target.value)}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-asky-orange-500 ${
                      errors.banEndDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.banEndDate && <p className="text-red-500 text-xs mt-1">{errors.banEndDate}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('passengers.severity')} *</label>
                <select
                  value={formData.severity}
                  onChange={e => handleInputChange('severity', e.target.value)}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-asky-orange-500"
                >
                  <option value="LOW">Faible</option>
                  <option value="MEDIUM">Moyen</option>
                  <option value="HIGH">Élevé</option>
                  <option value="CRITICAL">Critique</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('passengers.status')}</label>
                <select
                  value={formData.status}
                  onChange={e => handleInputChange('status', e.target.value)}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-asky-orange-500"
                >
                  <option value="ACTIVE">{t('passengers.active')}</option>
                  <option value="EXPIRED">{t('passengers.expired')}</option>
                  <option value="UNDER_REVIEW">{t('passengers.underReview')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('passengers.additionalenote')}</label>
              <textarea
                value={formData.notes}
                onChange={e => handleInputChange('notes', e.target.value)}
                rows={3}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-asky-orange-500"
                placeholder="Informations supplémentaires..."
              />
            </div>
          </div>

          {!isReadOnly && (
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('profile.cancel')}
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-asky-brown-600 text-white rounded-lg hover:bg-asky-brown-700 transition-colors flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{mode === 'create' ? t('passengers.add') : t('passengers.save')}</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </motion.div>
    </AnimatePresence>
  );
}

export default PassengerModal;
