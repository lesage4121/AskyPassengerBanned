import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextType {
  language: 'fr' | 'en';
  setLanguage: (lang: 'fr' | 'en') => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Traductions
const translations = {
  fr: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.passengers': 'Passagers bannis',
    'nav.users': 'Utilisateurs',
    'nav.profile': 'Profil',
    'nav.logout': 'Déconnexion',
    'nav.search': 'Rechercher...',
    'nav.notifications': 'Notifications',
    'nav.offline': 'Mode hors ligne',
    'nav.changeLanguage': 'Changer la langue',
    
    // Login
    'login.title': 'PassBanned',
    'login.subtitle': 'Système de gestion des passagers bannis',
    'login.company': 'Asky Airlines - Sécurité et conformité',
    'login.email': 'Adresse email',
    'login.password': 'Mot de passe',
    'login.signin': 'Se connecter',
    'login.signing': 'Connexion en cours...',
    'login.error': 'Email ou mot de passe incorrect',
    'login.demo': 'Comptes de démonstration :',
    'login.admin': 'Admin: admin@asky.com / admin123',
    'login.user': 'Utilisateur: user@asky.com / user123',
    'login.offline': '💡 Fonctionne même sans backend (mode hors ligne)',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Vue d\'ensemble du système PassBanned',
    'dashboard.totalBanned': 'Total bannis',
    'dashboard.activeBans': 'Bans actifs',
    'dashboard.criticalCases': 'Cas critiques',
    'dashboard.thisWeek': 'Cette semaine',
    'dashboard.recentBans': 'Bans récents',
    'dashboard.severityDistribution': 'Répartition par sévérité',
    'dashboard.critical': 'Critique',
    'dashboard.high': 'Élevé',
    'dashboard.medium': 'Moyen',
    'dashboard.low': 'Faible',
    'dashboard.alerts': 'Alertes système',
    'dashboard.criticalAlert': 'cas critiques nécessitent une attention immédiate',
    'dashboard.recentAlert': 'nouveaux bans cette semaine',
    'dashboard.erreurconn' : 'Erreur de connction',
    'dashboard.reessayer' : 'Réessayer',

    

    // Avatar et autres

    'avatar.questionajout':'Voulez-vous ajouter ou modifier votre avatar ?',
    'error.declaration': 'Une erreur est survenue.',
    'error.retouracceeuil' : 'Retour à l’accueil',
    
    // Passengers
    'passengers.title': 'Passagers bannis',
    'passengers.subtitle': 'Gestion de la liste des passagers interdits de vol',
    'passengers.add': 'Ajouter un passager',
    'passengers.export': 'Exporter CSV',
    'passengers.search': 'Rechercher par nom, email, passeport, nationalité...',
    'passengers.filters': 'Filtres',
    'passengers.severity': 'Sévérité',
    'passengers.status': 'Statut',
    'passengers.banDuration': 'Durée du ban',
    'passengers.nationality': 'Nationalité',
    'passengers.dateban':'Date du ban',
    'passengers.all': 'Toutes',
    'passengers.temporary': 'Temporaire',
    'passengers.permanent': 'Permanent',
    'passengers.active': 'Actif',
    'passengers.expired': 'Expiré',
    'passengers.underReview': 'En révision',
    'passengers.found': 'passager(s) trouvé(s)',
    'passenger.passenger':'Passager',
    'passenger.pfound':'trouvé',
    'passengers.noResults': 'Aucun passager trouvé',
    'passengers.noResultsDesc': 'Essayez de modifier vos critères de recherche ou filtres.',
    'passengers.empty': 'Aucun passager banni n\'est enregistré dans le système.',
    'passenger.importer':'Importer',
    'passenger.exporter': 'Exporter',
    'passengers.detailsban':'Détails du ban',
    'passengers.confirmsup': 'Confirmer la suppression',
    'passengers.supcomfirmé':'Êtes-vous sûr de vouloir supprimer ce passager banni ? Cette action est irréversible.',
    'passengers.next':'Page suivante',
    'passengers.previous':'Page précédente',
    'passengers.requestname': 'Le nom est requis',
    'passengers.requestprenom':'Le prénom est requis',
    'passengers.rquestpassport':'Le numéro de passeport est requis',
    'passengers.requestnationality':'La nationalité est requise',
    'passengers.requestdatebeth':'La date de naissance est requise',
    'passengers.requestbanraison':'La raison du ban est requise',
    'passengers.requestdateban':'La date du ban est requise',
    'passengers.requestendban':'La date de fin est requise pour un ban temporaire',
    'passengers.requestemailformat':'Format d\'email invalide',
    'passengers.titleaddpassenger': 'Ajouter un passager banni',
    'passengers.titlemodifierpassenger':'Ajouter un passager banni',
    'passengers.titlepassengerdetails':'Détails du passager',
    'passengers.passnumder':'Numéro de passeport',
    'passengers.datebith':'Date de naissance',
    'passengers.infoban': 'Informations du ban',
    'passengers.banraison': 'Raison du ban',
    'passengers.datefinban':'Date de fin du ban',
    'passengers.additionalenote':'Notes additionnelles',

    // Users
    'users.title': 'Gestion des utilisateurs',
    'users.subtitle': 'Administration des comptes utilisateurs du système',
    'users.add': 'Nouvel utilisateur',
    'users.total': 'Total utilisateurs',
    'users.admins': 'Administrateurs',
    'users.activeUsers': 'Utilisateurs actifs',
    'users.search': 'Rechercher par nom ou email...',
    'users.found': 'utilisateur',
    'users.role': 'Rôle',
    'users.admin': 'Administrateur',
    'users.user': 'Utilisateur',
    'users.created': 'Créé le',
    'users.lastLogin': 'Dernière connexion',
    'users.accessDenied': 'Accès refusé',
    'users.accessDeniedDesc': 'Vous devez être administrateur pour accéder à cette page.',
    'users.nouser':'Aucun utilisateur trouvé',

  
    
    // Profile
    'profile.title': 'Mon Profil',
    'profile.subtitle': 'Gérez vos informations personnelles et paramètres de compte',
    'profile.personalInfo': 'Informations personnelles',
    'profile.accountInfo': 'Informations du compte',
    'profile.security': 'Sécurité',
    'profile.edit': 'Modifier',
    'profile.save': 'Sauvegarder',
    'profile.cancel': 'Annuler',
    'profile.fullName': 'Nom complet',
    'profile.email': 'Adresse email',
    'profile.changePassword': 'Changer le mot de passe',
    'profile.currentPassword': 'Mot de passe actuel',
    'profile.newPassword': 'Nouveau mot de passe',
    'profile.confirmPassword': 'Confirmer le nouveau mot de passe',
    'profile.memberSince': 'Membre depuis',
    'profile.nele':'Né le',
    'profile.loginHistory': 'Historique des connexions',
    'profile.activeSessions': 'Sessions actives',
    'profile.picture':'Photo de profil',
    'profil.mask':'Masquer',
    
    // Common
    'common.save': 'Sauvegarder',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.view': 'Voir',
    'common.add': 'Ajouter',
    'common.create': 'Créer',
    'common.update': 'Mettre à jour',
    'common.confirm': 'Confirmer',
    'common.close': 'Fermer',
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.warning': 'Attention',
    'common.info': 'Information',
    'common.yes': 'Oui',
    'common.no': 'Non',
    'common.name': 'Nom',
    'common.email': 'Email',
    'common.phone': 'Téléphone',
    'common.date': 'Date',
    'common.status': 'Statut',
    'common.actions': 'Actions',
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.export': 'Exporter',
    'common.import': 'Importer',
    'common.upload': 'Télécharger',
    'common.download': 'Télécharger',
    'common.nationality':'NATIONALITE',
    'common.durée':'Durée',
    'common.modifiéle':'Modifié le',
    'common.raison':'Raison et notes',
    'common.prenom':'Prénom',
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.passengers': 'Banned Passengers',
    'nav.users': 'Users',
    'nav.profile': 'Profile',
    'nav.logout': 'Logout',
    'nav.search': 'Search...',
    'nav.notifications': 'Notifications',
    'nav.offline': 'Offline mode',
    'nav.changeLanguage': 'Change language',

    //avatar & others

    'avatar.questionajout':'Do you want to add or change your avatar?',
    'error.declaration': 'An error has occurred.',
    'error.retouracceeuil' : 'Return to home',
    
    // Login
    'login.title': 'PassBanned',
    'login.subtitle': 'Banned passengers management system',
    'login.company': 'Asky Airlines - Security and compliance',
    'login.email': 'Email address',
    'login.password': 'Password',
    'login.signin': 'Sign in',
    'login.signing': 'Signing in...',
    'login.error': 'Invalid email or password',
    'login.demo': 'Demo accounts:',
    'login.admin': 'Admin: admin@asky.com / admin123',
    'login.user': 'User: user@asky.com / user123',
    'login.offline': '💡 Works even without backend (offline mode)',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'PassBanned system overview',
    'dashboard.totalBanned': 'Total banned',
    'dashboard.activeBans': 'Active bans',
    'dashboard.criticalCases': 'Critical cases',
    'dashboard.thisWeek': 'This week',
    'dashboard.recentBans': 'Recent bans',
    'dashboard.severityDistribution': 'Severity distribution',
    'dashboard.critical': 'Critical',
    'dashboard.high': 'High',
    'dashboard.medium': 'Medium',
    'dashboard.low': 'Low',
    'dashboard.alerts': 'System alerts',
    'dashboard.criticalAlert': 'critical cases require immediate attention',
    'dashboard.recentAlert': 'new bans this week',
    'dashboard.erreurconn' : 'Connexion error',
    'dashboard.reessayer' : 'Try againr',

    // Passengers
    'passengers.title': 'Banned Passengers',
    'passengers.subtitle': 'Management of banned passengers list',
    'passengers.add': 'Add passenger',
    'passengers.export': 'Export CSV',
    'passengers.search': 'Search by name, email, passport, nationality...',
    'passengers.filters': 'Filters',
    'passengers.severity': 'Severity',
    'passengers.status': 'Status',
    'passengers.banDuration': 'Ban duration',
    'passengers.nationality': 'Nationality',
    'passengers.all': 'All',
    'passenger.passenger':'Passenger',
    'passengers.dateban':'Date of ban',
    'passenger.pfound':'found',
    'passengers.temporary': 'Temporary',
    'passengers.permanent': 'Permanent',
    'passengers.active': 'Active',
    'passengers.expired': 'Expired',
    'passengers.underReview': 'Under review',
    'passengers.found': 'passenger(s) found',
    'passengers.noResults': 'No passengers found',
    'passengers.noResultsDesc': 'Try modifying your search criteria or filters.',
    'passengers.empty': 'No banned passengers are registered in the system.',
    'passenger.importer':'Import',
    'passenger.exporter': 'Export',
    'passengers.detailsban':'Ban details',
    'passengers.confirmsup': 'Confirm deletion',
    'passengers.supcomfirmé':'Are you sure you want to remove this banned passenger? This action is irreversible.',
    'passengers.next':'Next page',
    'passengers.previous':'Previous page',
    "passengers.requestname": "Name is required",
    "passengers.requestprenom": "First name is required",
    "passengers.rquestpassport": "Passport number is required",
    "passengers.requestnationality": "Nationality is required",
    "passengers.requestdatebeth": "Date of birth is required",
    "passengers.requestbanraison": "Ban reason is required",
    "passengers.requestdateban": "Ban date is required",
    "passengers.requestendban": "End date is required for a temporary ban",
    "passengers.requestemailformat": "Invalid email format",
    'passengers.titleaddpassenger':'Add banned passenger',
    'passengers.titlemodifierpassenger':'Edit a banned passenger',
    'passengers.titlepassengerdetails':'Passenger Details',
    'passengers.passnumder':'Passport number',
    'passengers.datebith':'Date of birth',
    'passengers.infoban': 'Ban information',
    'passengers.banraison': 'Reason for ban',
    'passengers.datefinban':'Ban end date',
    'passengers.additionalenote':'Additional Notes',

    // Users
    'users.title': 'User Management',
    'users.subtitle': 'System user accounts administration',
    'users.add': 'New user',
    'users.total': 'Total users',
    'users.admins': 'Administrators',
    'users.activeUsers': 'Active users',
    'users.search': 'Search by name or email...',
    'users.found': 'user',
    'users.role': 'Role',
    'users.admin': 'Administrator',
    'users.user': 'User',
    'users.created': 'Created on',
    'users.lastLogin': 'Last login',
    'users.accessDenied': 'Access denied',
    'users.accessDeniedDesc': 'You must be an administrator to access this page.',
    'users.nouser':'No user found',
    
    // Profile
    'profile.title': 'My Profile',
    'profile.subtitle': 'Manage your personal information and account settings',
    'profile.personalInfo': 'Personal information',
    'profile.accountInfo': 'Account information',
    'profile.security': 'Security',
    'profile.edit': 'Edit',
    'profile.save': 'Save',
    'profile.cancel': 'Cancel',
    'profile.fullName': 'Full name',
    'profile.email': 'Email address',
    'profile.changePassword': 'Change password',
    'profile.currentPassword': 'Current password',
    'profile.newPassword': 'New password',
    'profile.confirmPassword': 'Confirm new password',
    'profile.memberSince': 'Member since',
    'profile.loginHistory': 'Login history',
    'profile.activeSessions': 'Active sessions',
    'profile.nele':'Born on',
    'profile.picture':'Profil picture',
    'profil.mask':'Hide',
    
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.add': 'Add',
    'common.create': 'Create',
    'common.update': 'Update',
    'common.confirm': 'Confirm',
    'common.close': 'Close',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.warning': 'Warning',
    'common.info': 'Information',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.name': 'Name',
    'common.email': 'Email',
    'common.phone': 'Phone',
    'common.date': 'Date',
    'common.status': 'Status',
    'common.actions': 'Actions',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.upload': 'Upload',
    'common.download': 'Download',
    'common.durée':'duration',
    'common.modifiéle':'Modified on',
    'common.raison':'Reason and notes',
    'common.prenom':'Last name',
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<'fr' | 'en'>('fr');

  useEffect(() => {
    // Charger la langue sauvegardée
    const savedLanguage = localStorage.getItem('passbanned_language') as 'fr' | 'en';
    if (savedLanguage && (savedLanguage === 'fr' || savedLanguage === 'en')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: 'fr' | 'en') => {
    setLanguageState(lang);
    localStorage.setItem('passbanned_language', lang);
  };

  const t = (key: string): string => {
     return (translations[language] as Record<string, string>)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}