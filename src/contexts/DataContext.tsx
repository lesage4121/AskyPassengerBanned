// Importation des modules React nécessaires
import React, { createContext, useContext, useState, useEffect } from 'react';

// Importation des services API et types
import { 
  passengerService, 
  userService, 
  ApiPassenger, 
  ApiUser, 
  CreateUserRequest 
} from '../services/Api';

// Définition du type d'un passager banni
export interface BannedPassenger {
  id: string;                              // Identifiant unique
  firstName: string;                       // Prénom
  lastName: string;                        // Nom
  email: string;                           // Email
  phone: string;                           // Téléphone
  passportNumber: string;                  // Numéro de passeport
  nationality: string;                     // Nationalité
  dateOfBirth: string;                     // Date de naissance
  banReason: string;                       // Raison du bannissement
  banDate: string;                         // Date du bannissement
  banDuration: 'PERMANENT' | 'TEMPORARY';  // Durée (permanent ou temporaire)
  banEndDate?: string;                     // Date de fin si temporaire
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; // Gravité
  notes: string;                           // Notes supplémentaires
  createdBy: string;                       // Créé par quel utilisateur
  lastModified: string;                    // Dernière modification
  status: 'ACTIVE' | 'EXPIRED' | 'UNDER_REVIEW'; // Statut actuel
}

// Définition du type d'un utilisateur du système
export interface SystemUser {
  id: string;
  name: string;                          // Nom complet
  email: string;                         // Email
  role: 'admin' | 'user';                // Rôle (admin ou simple utilisateur)
  status: 'active' | 'inactive';         // Statut du compte
  createdAt: string;                     // Date de création
  lastLogin: string;                     // Dernière connexion
  avatarurl?: string;                      // URL d’un avatar (optionnel)
  
}
/* ---------------------------------------------------------------------
   Définition du type du contexte global (DataContextType)
------------------------------------------------------------------------*/
interface DataContextType {
  passengers: BannedPassenger[];
  users: SystemUser[];
  addPassenger: (passenger: Omit<BannedPassenger, 'id' | 'createdBy' | 'lastModified'>) => void;
  updatePassenger: (id: string, passenger: Partial<BannedPassenger>) => void;
  deletePassenger: (id: string) => void;
  addUser: (user: Omit<SystemUser, 'id' | 'createdAt' | 'lastLogin'> & { password: string }) => void;
  updateUser: (id: string, user: Partial<SystemUser>) => void;
  deleteUser: (id: string) => void;
  searchPassengers: (query: string, filters?: any) => BannedPassenger[];
  loading : boolean;
  error : string | null;
  
  
}

// Création du contexte
const DataContext = createContext<DataContextType | undefined>(undefined);

/* ---------------------------------------------------------------------
   Fournisseur de données (DataProvider) - Composant principal
------------------------------------------------------------------------*/
export function DataProvider({ children }: { children: React.ReactNode }) {
  // États internes
  const [passengers, setPassengers] = useState<BannedPassenger[]>([]);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // useEffect pour charger les données au montage
  useEffect(() => {
    loadInitialData();
  }, []);

  /* ---------------------------------------------------------------------
     Fonction pour charger les données initiales
  ---------------------------------------------------------------------*/
  const loadInitialData = async () => {    
    try {
      setError(null);
      setLoading(true);
      // Récupère passagers + utilisateurs depuis l'API
      const [passengersResponse, usersResponse] = await Promise.all([
        passengerService.getAllPassengers(0, 100),
        userService.getAllUsers().catch(() => []) // si erreur → tableau vide
      ]);
      // Conversion API → format local
      setPassengers(passengersResponse.content.map(convertApiPassengerToLocal));

      if (Array.isArray(usersResponse)) {
        setUsers(usersResponse.map(convertApiUserToLocal));
      }
    } catch (error) {
      console.log(error)
      setError("Impossible de communiquer avec le serveur");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------------------------------------
     Fonctions de conversion (API ⇄ Local)
  ---------------------------------------------------------------------*/
  const convertApiPassengerToLocal = (apiPassenger: ApiPassenger): BannedPassenger => ({
    id: apiPassenger.id.toString(),
    firstName: apiPassenger.firstName,
    lastName: apiPassenger.lastName,
    email: apiPassenger.email,
    phone: apiPassenger.phone,
    passportNumber: apiPassenger.passportNumber,
    nationality: apiPassenger.nationality,
    dateOfBirth: apiPassenger.dateOfBirth,
    banReason: apiPassenger.banReason,
    banDate: apiPassenger.banDate,
    banDuration: apiPassenger.banDuration,
    banEndDate: apiPassenger.banEndDate,
    severity: apiPassenger.severity,
    notes: apiPassenger.notes || '',
    createdBy: apiPassenger.createdByEmail,
    lastModified: apiPassenger.updatedAt,
    status: apiPassenger.status
  });

  const convertApiUserToLocal = (apiUser: ApiUser): SystemUser => ({
    id: apiUser.id.toString(),
    name: apiUser.name,
    email: apiUser.email,
    role: apiUser.role.toLowerCase() as 'admin' | 'user',
    status: apiUser.status.toLowerCase() as 'active' | 'inactive',
    createdAt: apiUser.createdAt,
    lastLogin: apiUser.lastLogin,
    avatarurl: apiUser.avatarUrl
  });

  /* ---------------------------------------------------------------------
     Gestion des passagers (CRUD)
  ---------------------------------------------------------------------*/
  const addPassenger = async (passenger: Omit<BannedPassenger, 'id' | 'createdBy' | 'lastModified'>) => {
      try {
        setError(null);
      // Mode online → envoi API
      const apiPassenger = await passengerService.createPassenger(passenger);
      const localPassenger = convertApiPassengerToLocal(apiPassenger);
      setPassengers(prev => [...prev, localPassenger]);
    } catch (error) {
      console.error('Erreur ajout passager:', error);
      setError("Impossible de communiquer avec le serveur");
      throw error;
    }
  };

 const updatePassenger = async (id: string, updates: Partial<BannedPassenger>) => {
    try {
      setError(null);
      const apiUpdates = {
        firstName: updates.firstName,
        lastName: updates.lastName,
        email: updates.email,
        phone: updates.phone,
        passportNumber: updates.passportNumber,
        nationality: updates.nationality,
        dateOfBirth: updates.dateOfBirth,
        banReason: updates.banReason,
        banDate: updates.banDate,
        banDuration: updates.banDuration?.toUpperCase() as "PERMANENT" | "TEMPORARY",
        banEndDate: updates.banEndDate,
        severity: updates.severity?.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' ,
        notes: updates.notes,
        status: updates.status?.toUpperCase() as 'ACTIVE' | 'EXPIRED' | 'UNDER_REVIEW'
      };
      
      const updatedPassenger = await passengerService.updatePassenger(parseInt(id), apiUpdates);
      const localPassenger = convertApiPassengerToLocal(updatedPassenger);
      
      setPassengers(prev => prev.map(passenger => 
        passenger.id === id ? localPassenger : passenger
      ));
    } catch (error) {
      console.error('Error updating passenger:', error);
      throw error;
    }
  };

  const deletePassenger = async (id: string) => {
    try {
      setError(null);
      await passengerService.deletePassenger(parseInt(id));
      setPassengers(prev => prev.filter(passenger => passenger.id !== id));
    } catch (error) {
      console.error('Error deleting passenger:', error);
      throw error;
    }
  };

  const addUser = async (user: Omit<SystemUser, 'id' | 'createdAt' | 'lastLogin'> & { password: string }) => {
    try {
      setError(null);
      const createUserRequest: CreateUserRequest = {
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role.toUpperCase() as 'USER' | 'ADMIN',
        status: user.status.toUpperCase() as 'ACTIVE' | 'INACTIVE',
        avatarUrl: user.avatarurl
      };
      
      const createdUser = await userService.createUser(createUserRequest);
      const localUser = convertApiUserToLocal(createdUser);
      setUsers(prev => [...prev, localUser]);
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  };

  const updateUser = async (id: string, updates: Partial<SystemUser> & {password?:string}) => {
    try {
      setError(null);
      const apiUpdates: any = {
        name: updates.name,
        email: updates.email,
        role: updates.role?.toUpperCase() as 'USER' | 'ADMIN' ,
        status: updates.status?.toUpperCase() as 'ACTIVE' | 'INACTIVE',
        avatarurl: updates.avatarurl,
      };

      if(updates.password) {
        apiUpdates.password = updates.password
      }
      const updatedUser = await userService.updateUser(parseInt(id), apiUpdates);
      const localUser = convertApiUserToLocal(updatedUser);
      
      setUsers(prev => prev.map(user => 
        user.id === id ? localUser : user
      ));
    } catch (error) {
      setError(null);
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      setError(null);
      await userService.deleteUser(parseInt(id));
      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };
  

  /* ---------------------------------------------------------------------
     Recherche de passagers
  ---------------------------------------------------------------------*/
const searchPassengers = (query: string, filters?: any): BannedPassenger[] => {
  let results = passengers;

  // Recherche textuelle
  if (query.trim()) {
    const searchTerm = query.toLowerCase();
    results = results.filter(passenger => 
      passenger.firstName.toLowerCase().includes(searchTerm) ||
      passenger.lastName.toLowerCase().includes(searchTerm) ||
      passenger.email.toLowerCase().includes(searchTerm) ||
      passenger.passportNumber.toLowerCase().includes(searchTerm) ||
      passenger.nationality.toLowerCase().includes(searchTerm)
    );
  }

  // Application des filtres
  if (filters) {
    if (filters.severity) 
      results = results.filter(p => p.severity.toLowerCase() === filters.severity.toLowerCase());
    if (filters.status) 
      results = results.filter(p => p.status.toLowerCase() === filters.status.toLowerCase());
    if (filters.banDuration) 
      results = results.filter(p => p.banDuration.toLowerCase() === filters.banDuration.toLowerCase());
    if (filters.nationality) {
      const nat = filters.nationality.toLowerCase();
      results = results.filter(p => p.nationality.toLowerCase().includes(nat));
    }
  }

  return results;
};

  /* ---------------------------------------------------------------------
     Fourniture des données via le Provider
  ---------------------------------------------------------------------*/
  return (
    <DataContext.Provider value={{
      passengers,
      users,
      addPassenger,
      updatePassenger,
      deletePassenger,
      addUser,
      updateUser,
      deleteUser,
      searchPassengers,
      loading,
      error
    }}>
      {children}
    </DataContext.Provider>
  );
}

/* ---------------------------------------------------------------------
   Hook personnalisé pour consommer le contexte
------------------------------------------------------------------------*/
export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
