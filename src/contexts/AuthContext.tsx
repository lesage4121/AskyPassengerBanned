import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService,LoginRequest } from '../services/Api';

/* ----------- Définition du type User ----------- */
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';  // Un compte peut être actif ou inactif
  avatar?: string;
  createdAt: string;
  lastLogin: string;
}

/* ----------- Définition du type du contexte ----------- */
interface AuthContextType {
  user: User | null;  // utilisateur connecté
  login: (email: string, password: string) => Promise<boolean>; 
  logout: () => void;
  isAdmin: boolean;
}

/* ----------- Création du contexte ----------- */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ----------- Fournisseur du contexte ----------- */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Restaure une session sauvegardée (si l’utilisateur était déjà connecté avant)
  useEffect(() => {
    const savedUser = localStorage.getItem('passbanned_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  /* ----------- Fonction de connexion ----------- */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // 1️⃣ Tentative de connexion via le backend
      const credentials: LoginRequest = { email, password };
      const response = await authService.login(credentials);
      
      // Sauvegarde du token JWT ou autre jeton de session
      localStorage.setItem('passbanned_token', response.token);
      
      // Conversion de la réponse API vers notre modèle User local
      const user: User = {
        id: response.user.id.toString(),
        name: response.user.name,
        email: response.user.email,
        role: response.user.role.toLowerCase() as 'admin' | 'user',
        status: response.user.status.toLowerCase() as 'active' | 'inactive',
        avatar: response.user.avatarUrl,
        createdAt: response.user.createdAt,
        lastLogin: response.user.lastLogin
      };
      // Mise à jour du state et sauvegarde dans localStorage
      setUser(user);
      localStorage.setItem('passbanned_user', JSON.stringify(user));
      return true;
    } catch (error) {
      return false; // identifiants incorrects
    }
  };

  /* ----------- Fonction de déconnexion ----------- */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('passbanned_user');
    localStorage.removeItem('passbanned_token');
    localStorage.removeItem('passbanned_offline_mode');
  };

  /* ----------- Raccourci pour vérifier si l’utilisateur est admin ----------- */
  const isAdmin = user?.role === 'admin';

  /* ----------- Fourniture du contexte à toute l’app ----------- */
  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ----------- Hook personnalisé pour utiliser le contexte ----------- */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
