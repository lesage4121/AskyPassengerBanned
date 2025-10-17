import {  UserX, AlertTriangle, TrendingUp, Shield, Clock } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import StatsCard from '../components/StatsCard';
import {motion} from "framer-motion";
import { useLanguage } from '../contexts/LanguageContext';


function Dashboard() {
const { passengers, loading,error} = useData();
const {t} = useLanguage();

   if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }


  const stats = {
    totalBanned: passengers.length,
    activeBans: passengers.filter(p => p.status === 'ACTIVE').length,
    criticalCases: passengers.filter(p => p.severity === 'CRITICAL').length,
    recentBans: passengers.filter(p => {
      const banDate = new Date(p.banDate);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return banDate >= weekAgo;
    }).length
  };

  const severityColors = {
    LOW: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-800',
    CRITICAL: 'bg-red-100 text-red-800'
  };

  const recentPassengers = passengers
    .sort((a, b) => new Date(b.banDate).getTime() - new Date(a.banDate).getTime())
    .slice(0, 5);


 if (loading ) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Cercle de chargement */}
        <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  if (error && !loading) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-red-50 dark:bg-red-900">
      <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">{t('dashboard.erreurconn')}</h2>
        <p className="text-gray-700 dark:text-gray-300">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          {t('dashboard.reessayer')}
        </button>
      </div>
    </div>
  );
}

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div 
      initial ={{opacity:0 , y: -20}}
      animate = {{opacity:1, y:0}}
      transition={{duration:0.5}}
      className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">{t('dashboard.subtitle')}</p>
      </motion.div>

      <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }} 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title={t('dashboard.totalBanned')}
          value={stats.totalBanned}
          icon={UserX}
          color="brown"
        />
        <StatsCard
          title={t('dashboard.activeBans')}
          value={stats.activeBans}
          icon={Shield}
          color="orange"
        />
        <StatsCard
          title={t('dashboard.criticalCases')}
          value={stats.criticalCases}
          icon={AlertTriangle}
          color="brown"
        />
        <StatsCard
          title={t('dashboard.thisWeek')}
          value={stats.recentBans}
          icon={TrendingUp}
          color="orange"
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Passagers récemment bannis */}
        <motion.div 
        initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <Clock className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" />
              {t('dashboard.recentBans')}
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentPassengers.map((passenger) => (
                <div key={passenger.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {passenger.firstName} {passenger.lastName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{passenger.nationality}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(passenger.banDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${severityColors[passenger.severity]}`}>
                      {passenger.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Répartition par sévérité */}
        <motion.div
        initial={{opacity:0, x:30}}
        animate ={{opacity:1, x:0}}
        transition={{duration:0.9}}
         className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" />
              {t('dashboard.severityDistribution')}
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((severity,index) => {
                const count = passengers.filter(p => p.severity === severity).length;
                const percentage = passengers.length > 0 ? (count / passengers.length) * 100 : 0;
                
                return (
                  <motion.div
                  initial = {{opacity:0, x:20}}
                  animate ={{opacity:1, x:0}}
                  transition={{duration: 0.5, delay: index*0.3}}
                  key={severity} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        severity === 'CRITICAL' ? 'bg-red-500' :
                        severity === 'HIGH' ? 'bg-orange-500' :
                        severity === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {severity === 'CRITICAL' ? 'Critique' :
                         severity === 'HIGH' ? 'Élevé' :
                         severity === 'MEDIUM' ? 'Moyen' : 'Faible'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-300">{count}</span>
                      <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            severity === 'CRITICAL' ? 'bg-red-500' :
                            severity === 'HIGH' ? 'bg-orange-500' :
                            severity === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Alertes et notifications */}
      <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2" />
          <div>
            <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300">Alertes système</h4>
            <div className="mt-1 text-sm text-amber-700 dark:text-amber-200">
              <p>• {stats.criticalCases} {t('dashboard.criticalAlert')}</p>
              <p>• {stats.recentBans} {t('dashboard.recentAlert')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;