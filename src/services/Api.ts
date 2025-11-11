import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Interface représentant une erreur renvoyée par l'API
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path?: string;
}
// Déclaration pour TypeScript
declare global {
  interface Window {
    handleGlobalError: (error: ApiError) => void;
  }
}

// Création d'une instance Axios configurée pour notre API
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ----------- Intercepteurs de requêtes (avant envoi) -----------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('passbanned_token');
    if (token) {
      // Ajout du token dans l'en-tête Authorization
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ----------- Intercepteurs de réponses (après réception) -----------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response ) {
      const status = error.response.status;
      // On considère que seules certaines erreurs "critiques" déclenchent la page globale
      if (status != 400) {
        const apiError = error.response.data as ApiError;
        window.handleGlobalError(apiError);
      }
}
    return Promise.reject(error);
  }
);


export default api;


export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: number
  token: string;
  type: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: 'USER' | 'ADMIN';
    status: 'ACTIVE' | 'INACTIVE';
    avatarUrl?: string;
    lastLogin: string;
    createdAt: string;
    updatedAt: string;
    mfaEnabled:boolean
  };
}

// Utilisateur renvoyé par l’API
export interface ApiUser {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE';
  avatarUrl?: string;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  mfaEnabled: boolean;
}

// Requête pour créer un utilisateur
export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE';
  avatarUrl?: string;
  mfaEnabled: boolean;
}

// Passager renvoyé par l’API
export interface ApiPassenger {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passportNumber: string;
  nationality: string;
  dateOfBirth: string;
  banReason: string;
  banDate: string;
  banDuration: 'TEMPORARY' | 'PERMANENT';
  banEndDate?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  notes?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'UNDER_REVIEW';
  createdByName: string;
  createdByEmail: string;
  createdAt: string;
  updatedAt: string;
}

// Requête pour créer un passager
export interface CreatePassengerRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passportNumber: string;
  nationality: string;
  dateOfBirth: string;
  banReason: string;
  banDate: string;
  banDuration: 'TEMPORARY' | 'PERMANENT';
  banEndDate?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  notes?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'UNDER_REVIEW';
}

// Pagination standardisée pour les réponses API
export interface PageResponse<T> {
  content: T[];
  pageable: {
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  empty: boolean;
}

// Statistiques du tableau de bord
export interface DashboardStats {
  passengers: {
    total: number;
    active: number;
    critical: number;
    recent: number;
  };
  users: {
    total: number;
    admins: number;
    active: number;
  };
}
// Service d'authentification
export const authService = {
  login: async (credentials: LoginRequest): Promise<any> => {
    const response = await api.post('/auth/login', credentials);
    const data = response.data;

    // Cas 1 : MFA non requis
    if (!data.mfaRequired) {
      return {
        success: true,
        token: data.token,
        user: data.user,
        mfaRequired: false,
      };
    }

    // Cas 2 : MFA requis mais pas encore configuré
    if (data.mfaSetup && !data.user.mfaConfigured) {
      return {
        success: false,
        mfaSetup: true,
        otpAuthUrl: data.otpAuthUrl,
        user: data.user,
      };
    }

    // Cas 3 : MFA requis et déjà configuré
    return {
      success: false,
      mfaRequired: true,
      user: data.user,
    };
  },

  verifyMfa: async (email: string, code: string): Promise<any> => {
    const response = await api.post('/auth/mfa/verify', { email, code });
    console.log(JSON.stringify(response))
    return response.data;

  },

  validateToken: async (token: string): Promise<boolean> => {
    try {
      await api.post('/auth/validate', null, { params: { token } });
      return true;
    } catch {
      return false;
    }
  },
};


// Service de gestion des utilisateurs
export const userService = {
  changePassword: async (id: number,avatarUrl: string,  currentPassword: string, newPassword: string): Promise<void> => {
    console.log("lien avatar envoyé:"+avatarUrl)
     await api.post(`/users/${id}/password`, { avatarUrl , currentPassword, newPassword, });
 
  },
  getAllUsers: async (): Promise<ApiUser[]> => {
    const response = await api.get<ApiUser[]>('/users');
    return response.data;
    
  },

  getUserById: async (id: number): Promise<ApiUser> => {
    const response = await api.get<ApiUser>(`/users/${id}`);
    return response.data;
  },

  createUser: async (user: CreateUserRequest): Promise<ApiUser> => {
    const response = await api.post<ApiUser>('/users', user);
    return response.data;
  },

  updateUser: async (id: number, user: Partial<ApiUser> & {password?:string}): Promise<ApiUser> => {
    const response = await api.put<ApiUser>(`/users/${id}`, user);
    return response.data;

  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  // Récupérer les stats utilisateurs
  getUserStats: async (): Promise<{ totalUsers: number; adminCount: number; activeUsers: number }> => {
    const response = await api.get('/users/stats');
    return response.data;
  },
  uploadAvatar: async (id: number, file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post<{ avatarUrl: string }>(`/users/${id}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadAvatarForNewUser: async (file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post<{ avatarUrl: string }>('/users/avatar/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  resetMFA: async (id: number): Promise<string> => {
  const response = await api.post(`/users/${id}/reset-mfa`)
  return response.data.status;
},
}


// Service pour upload des fichiers
export const fileService = {
  uploadUserAvatar: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<{ url: string }>('/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.url; 
  },
};

// Service de gestion des passagers
export const passengerService = {
  getAllPassengers: async (page = 0, size = 10, sortBy = 'banDate', sortDir = 'desc'): Promise<PageResponse<ApiPassenger>> => {
    const response = await api.get<PageResponse<ApiPassenger>>('/passengers', {
      params: { page, size, sortBy, sortDir }
    });
    return response.data;
  },

  getPassengerById: async (id: number): Promise<ApiPassenger> => {
    const response = await api.get<ApiPassenger>(`/passengers/${id}`);
    return response.data;
  },

  getPassengerByPassport: async (passportNumber: string): Promise<ApiPassenger> => {
    const response = await api.get<ApiPassenger>(`/passengers/passport/${passportNumber}`);
    return response.data;
  },

  createPassenger: async (passenger: CreatePassengerRequest): Promise<ApiPassenger> => {
    const response = await api.post<ApiPassenger>('/passengers', passenger);
    return response.data;
  },

  updatePassenger: async (id: number, passenger: Partial<CreatePassengerRequest>): Promise<ApiPassenger> => {
    const response = await api.put<ApiPassenger>(`/passengers/${id}`, passenger);
    return response.data;
  },

  deletePassenger: async (id: number): Promise<void> => {
    await api.delete(`/passengers/${id}`);
  },

  // Recherche par mot-clé
  searchPassengers: async (query: string, page = 0, size = 10): Promise<PageResponse<ApiPassenger>> => {
    const response = await api.get<PageResponse<ApiPassenger>>('/passengers/search', {
      params: { query, page, size }
    });
    return response.data;
  },

  // Filtrage multi-critères
  filterPassengers: async (filters: {
    severity?: string;
    status?: string;
    banDuration?: string;
    nationality?: string;
  }, page = 0, size = 10): Promise<PageResponse<ApiPassenger>> => {
    const response = await api.get<PageResponse<ApiPassenger>>('/passengers/filter', {
      params: { ...filters, page, size }
    });
    return response.data;
  },

  // Récupérer les bannissements récents
  getRecentBans: async (days = 7): Promise<ApiPassenger[]> => {
    const response = await api.get<ApiPassenger[]>('/passengers/recent', {
      params: { days }
    });
    return response.data;
  },

  // Statistiques des passagers
  getPassengerStats: async (): Promise<{ totalPassengers: number; activeBans: number; criticalCases: number }> => {
    const response = await api.get('/passengers/stats');
    return response.data;
  },
};

// Service de stats globales (Dashboard)
export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/dashboard/stats');
    return response.data;
  },
};
