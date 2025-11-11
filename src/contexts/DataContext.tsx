
import React, { createContext, useContext, useState, useEffect } from 'react';

import { 
  passengerService, 
  userService, 
  ApiPassenger, 
  ApiUser, 
  CreateUserRequest 
} from '../services/Api';



export interface BannedPassenger {
  id: string;                              
  firstName: string;                      
  lastName: string;                        
  email: string;                          
  phone: string;                           
  passportNumber: string;                  
  nationality: string;                     
  dateOfBirth: string;                     
  banReason: string;                       
  banDate: string;                         
  banDuration: 'PERMANENT' | 'TEMPORARY'; 
  banEndDate?: string;                     
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; 
  notes: string;                           
  createdBy: string;                       
  lastModified: string;                   
  status: 'ACTIVE' | 'EXPIRED' | 'UNDER_REVIEW'; 
}


export interface SystemUser {
  id: string;
  name: string;                          
  email: string;                         
  role: 'admin' | 'user';                
  status: 'active' | 'inactive';         
  createdAt: string;                     
  lastLogin: string;                     
  avatarurl?: string;  
  mfaEnabled:boolean                  
  
}

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
  setToken:React.Dispatch<React.SetStateAction<string | null>>;
  
  
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [passengers, setPassengers] = useState<BannedPassenger[]>([]);
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
   const [token, setToken] = useState<string | null>(localStorage.getItem("passbanned_token"))


  useEffect(() => {
  if(!token) return;
    loadInitialData();
  }, [token]);

  const loadInitialData = async () => {    
    try {
      setError(null);
      setLoading(true);

      const [passengersResponse, usersResponse] = await Promise.all([
        passengerService.getAllPassengers(0, 100),
        userService.getAllUsers().catch(() => []) 
      ]);
      // Conversion API → format local
      setPassengers(passengersResponse.content.map(convertApiPassengerToLocal));

      if (Array.isArray(usersResponse)) {
        setUsers(usersResponse.map(convertApiUserToLocal));
      }
    } catch (error) {
      console.log(error)
      setError("Unable to communicate with the server");
    } finally {
      setLoading(false);
    }
  };


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
    avatarurl: apiUser.avatarUrl,
    mfaEnabled: apiUser.mfaEnabled,
  });


  const addPassenger = async (passenger: Omit<BannedPassenger, 'id' | 'createdBy' | 'lastModified'>) => {
      try {
        setError(null);
      const apiPassenger = await passengerService.createPassenger(passenger);
      const localPassenger = convertApiPassengerToLocal(apiPassenger);
      setPassengers(prev => [...prev, localPassenger]);
    } catch (error) {
      console.log('Error adding passenger:', error);
      setError("Unable to communicate with the server");
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
        avatarUrl: user.avatarurl,
        mfaEnabled:user.mfaEnabled
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
        mfaEnabled: updates.mfaEnabled,
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
  

const searchPassengers = (query: string, filters?: any): BannedPassenger[] => {
  let results = passengers;
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
      error,
      setToken,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
