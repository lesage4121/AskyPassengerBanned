import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService,LoginRequest } from '../services/Api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  avatar?: string;
  createdAt: string;
  lastLogin: string;
}

/* ----------- Définition du type du contexte ----------- */
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>; 
  logout: () => void;
  isAdmin: boolean;
   loading: boolean; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaure une session sauvegardée (si l’utilisateur était déjà connecté avant)
  useEffect(() => {
    const checkSession = async () => {
      const savedUser = localStorage.getItem('passbanned_user');
      const token = localStorage.getItem('passbanned_token');   

      if (!token || !savedUser) {
      console.log('Aucun token trouvé — déconnexion automatique.');
      logout();
      setLoading(false);
      return;
    }

      if (savedUser && token) {
        const isValid = await authService.validateToken(token);
        if (isValid) {
          setUser(JSON.parse(savedUser));
        } else {
          console.log('Token expiré ou invalide — déconnexion automatique.');
          logout();
        }
        setLoading(false);
      }
    };
   checkSession();
  }, []);

  /* ----------- Fonction de connexion ----------- */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const credentials: LoginRequest = { email, password };
      const response = await authService.login(credentials);
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
      setUser(user);
      localStorage.setItem('passbanned_user', JSON.stringify(user));
      return true;
    } catch (error) {
      return false; 
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('passbanned_user');
    localStorage.removeItem('passbanned_token');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin,loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
