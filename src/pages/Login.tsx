import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react'; 
import { useAuth } from '../contexts/AuthContext'; // Hook perso pour gérer l'authentification

function Login() {
  const [email, setEmail] = useState('');             
  const [password, setPassword] = useState('');       
  const [showPassword, setShowPassword] = useState(false); 
  const [loading, setLoading] = useState(false);      // Indique si la requête est en cours
  const [error, setError] = useState('');             // Message d'erreur affiché en cas de problème

  const { login } = useAuth();

  // Fonction appelée lors de la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Empêche le rechargement de la page
    setLoading(true);   // Active le mode "chargement"
    setError('');       // Réinitialise les erreurs

    try {
      // Appelle la fonction login avec l'email et le mot de passe
      const success = await login(email, password);
      if (!success) {
        setError('Email ou mot de passe incorrect');
      }
    } catch (error) {
      // En cas d'erreur réseau ou autre
      setError('Une erreur est survenue lors de la connexion');
    } finally {
      setLoading(false); // Désactive le mode "chargement"
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* ---- Image de fond avec overlay ---- */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/image_Avion.png" 
          alt="Avion ASKY" 
          className="w-full h-full object-cover"
        />
        {/* Dégradé sombre pour rendre le texte lisible */}
        <div className="absolute inset-0 bg-gradient-to-br from-asky-orange-900/70 via-asky-brown-900/80 to-gray-900/90 dark:from-gray-900/80 dark:via-asky-brown-900/90 dark:to-black/95"></div>
      </div>
      
      {/* ---- Contenu principal ---- */}
      <div className="max-w-md w-full space-y-8 p-8">
        
        {/* En-tête (logo + titre) */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white drop-shadow-lg">PassBanned</h2>
        </div>

        {/* ---- Carte de connexion ---- */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 relative z-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Champ Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Adresse email
              </label>
              <div className="relative">
                {/* Icône email */}
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                {/* Input email */}
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} // Mise à jour de l'état
                  required
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-asky-orange-500"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            {/* Champ Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                {/* Icône mot de passe */}
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                {/* Input mot de passe (texte ou caché) */}
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'} // Affiche ou masque le mot de passe
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-asky-orange-500"
                  placeholder="••••••••"
                />
                {/* Bouton pour afficher/masquer */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)} // Inverse l'état
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Message d'erreur si connexion échoue */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={loading} // Désactive si en cours de connexion
              className="mt-10 w-full flex justify-center py-3 px-4 rounded-lg text-sm font-medium text-white bg-asky-brown-600 hover:bg-asky-brown-700 focus:ring-2 focus:ring-offset-2 focus:ring-asky-brown-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

          {/* ---- Infos démo ---- */}
        
        </div>
      </div>
    </div>
  );
}

export default Login;
