import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, User } from 'lucide-react';
import { BannedPassenger } from '../contexts/DataContext';
import { motion } from 'framer-motion';

interface PassengerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (passenger: Omit<BannedPassenger, 'id' | 'createdBy' | 'lastModified'>) => void;
  passenger?: BannedPassenger;
  mode: 'create' | 'edit' | 'view';
}

function PassengerModal({ isOpen, onClose, onSave, passenger, mode }: PassengerModalProps) {
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
    status: 'ACTIVE' as 'ACTIVE' | 'EXPIRED' | 'UNDER_REVIEW'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
        status: passenger.status
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
        status: 'ACTIVE'
      });
    }
  }, [passenger, mode, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'Le prénom est requis';
    if (!formData.lastName.trim()) newErrors.lastName = 'Le nom est requis';
    if (!formData.email.trim()) newErrors.email = 'L\'email est requis';
    if (!formData.passportNumber.trim()) newErrors.passportNumber = 'Le numéro de passeport est requis';
    if (!formData.nationality.trim()) newErrors.nationality = 'La nationalité est requise';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'La date de naissance est requise';
    if (!formData.banReason.trim()) newErrors.banReason = 'La raison du ban est requise';
    if (!formData.banDate) newErrors.banDate = 'La date du ban est requise';

    if (formData.banDuration === 'TEMPORARY' && !formData.banEndDate) {
      newErrors.banEndDate = 'La date de fin est requise pour un ban temporaire';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';
  const title = mode === 'create' ? 'Ajouter un passager banni' : 
                mode === 'edit' ? 'Modifier le passager' : 'Détails du passager';

  return (
    <motion.div
    initial={{opacity:0, y:-30}}
    animate={{opacity:1, y:0}}
    transition={{duration:0.8}}
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {isReadOnly ? (
            /* Mode visualisation - Affichage simple */
            <div className="space-y-8">
              {/* Informations personnelles */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 flex items-center mb-6">
                  <User className="h-5 w-5 mr-2" />
                  Informations personnelles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      <span className="font-bold">Prénom:  </span><span className="font-normal">{formData.firstName}</span></h4>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                       <span className="font-bold">Nom:  </span><span className="font-normal">{formData.lastName}</span></h4>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                       <span className="font-bold">Email:  </span><span className="font-normal">{formData.email}</span></h4>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                       <span className="font-bold">Téléphone:  </span><span className="font-normal">{formData.phone}</span></h4>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      <span className="font-bold">Numéro de passeport:  </span><span className="font-normal">{formData.passportNumber}</span></h4>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      <span className="font-bold">Nationalité:  </span><span className="font-normal">{formData.nationality}</span></h4>
                  </div>
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      <span className="font-bold">Date de naissance:  </span><span className="font-normal">{new Date(formData.dateOfBirth).toLocaleDateString('fr-FR')}</span></h4>                  
                  </div>
                </div>
              </div>

              {/* Informations du ban */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 flex items-center mb-6">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Informations du ban
                </h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Raison du ban</h4>
                    <p className="text-gray-900 bg-red-50 p-4 rounded-lg border border-red-200">
                      {formData.banReason}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        <span className="font-bold">Date du ban:  </span><span className="font-normal">{new Date(formData.banDate).toLocaleDateString('fr-FR')}</span></h4>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        <span className="font-bold">Durée du ban:  </span><span className="font-normal">{formData.banDuration === 'PERMANENT' ? 'Permanent' : 'Temporaire'}</span></h4>
                    </div>
                    {formData.banDuration === 'TEMPORARY' && formData.banEndDate && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2"> <span className="font-bold">Date de fin du ban:  </span><span className="font-normal">{new Date(formData.banEndDate).toLocaleDateString('fr-FR')}</span></h4>
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2"> <span className="font-bold">Sévérité:  </span> <span className="font-normal">{formData.severity === 'CRITICAL' ? 'Critique' :
                         formData.severity === 'HIGH' ? 'Élevé' :
                         formData.severity === 'MEDIUM' ? 'Moyen' : 'Faible'}</span></h4>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Statut:  {formData.status === 'ACTIVE' ? 'Actif' :
                         formData.status === 'EXPIRED' ? 'Expiré' : 'En révision'}</h4>
                    </div>
                  </div>
                  {formData.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Notes additionnelles</h4>
                      <p className="text-gray-900 bg-blue-50 p-4 rounded-lg border border-blue-200">
                        {formData.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Mode édition - Champs de saisie */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informations personnelles */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Informations personnelles
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-asky-orange-500 ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-asky-orange-500 ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-asky-orange-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-asky-orange-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de passeport *
                  </label>
                  <input
                    type="text"
                    value={formData.passportNumber}
                    onChange={(e) => handleInputChange('passportNumber', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-asky-orange-500 ${
                      errors.passportNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.passportNumber && <p className="text-red-500 text-xs mt-1">{errors.passportNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nationalité *
                  </label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-asky-orange-500 ${
                      errors.nationality ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.nationality && <p className="text-red-500 text-xs mt-1">{errors.nationality}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de naissance *
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-asky-orange-500 ${
                      errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
                </div>
              </div>

              {/* Informations du ban */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Informations du ban
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Raison du ban *
                  </label>
                  <textarea
                    value={formData.banReason}
                    onChange={(e) => handleInputChange('banReason', e.target.value)}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-asky-orange-500 ${
                      errors.banReason ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.banReason && <p className="text-red-500 text-xs mt-1">{errors.banReason}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date du ban *
                  </label>
                  <input
                    type="date"
                    value={formData.banDate}
                    onChange={(e) => handleInputChange('banDate', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-asky-orange-500 ${
                      errors.banDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.banDate && <p className="text-red-500 text-xs mt-1">{errors.banDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Durée du ban *
                  </label>
                  <select
                    value={formData.banDuration}
                    onChange={(e) => handleInputChange('banDuration', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-asky-orange-500"
                  >
                    <option value="TEMPORARY">Temporaire</option>
                    <option value="PERMANENT">Permanent</option>
                  </select>
                </div>

                {formData.banDuration === 'TEMPORARY' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de fin du ban *
                    </label>
                    <input
                      type="date"
                      value={formData.banEndDate}
                      onChange={(e) => handleInputChange('banEndDate', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-asky-orange-500 ${
                        errors.banEndDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.banEndDate && <p className="text-red-500 text-xs mt-1">{errors.banEndDate}</p>}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sévérité *
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => handleInputChange('severity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-asky-orange-500"
                  >
                    <option value="LOW">Faible</option>
                    <option value="MEDIUM">Moyen</option>
                    <option value="HIGH">Élevé</option>
                    <option value="CRITICAL">Critique</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-asky-orange-500"
                  >
                    <option value="ACTIVE">Actif</option>
                    <option value="EXPIRED">Expiré</option>
                    <option value="UNDER_REVIEW">En révision</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes additionnelles
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-asky-orange-500"
                    placeholder="Informations supplémentaires..."
                  />
                </div>
              </div>
            </div>
          )}

          {!isReadOnly && (
            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-asky-brown-600 text-white rounded-lg hover:bg-asky-brown-700 transition-colors flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{mode === 'create' ? 'Ajouter' : 'Sauvegarder'}</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </motion.div>
  );
}

export default PassengerModal;