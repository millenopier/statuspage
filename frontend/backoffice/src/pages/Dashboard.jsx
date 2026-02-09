import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getServices, getIncidents, getMaintenances, toggleIncidentVisibility } from '../services/api';
import { useThemeStore } from '../contexts/themeStore';

export default function Dashboard() {
  const theme = useThemeStore((state) => state.theme);
  const [stats, setStats] = useState({
    services: 0,
    incidents: 0,
    maintenances: 0,
    operational: 0,
  });
  const [activeIncidents, setActiveIncidents] = useState([]);
  const [degradedServices, setDegradedServices] = useState([]);

  const fetchStats = async () => {
    try {
      const [servicesRes, incidentsRes, maintenancesRes] = await Promise.all([
        getServices(),
        getIncidents(),
        getMaintenances(),
      ]);

      const services = servicesRes.data || [];
      const incidents = incidentsRes.data || [];
      const maintenances = maintenancesRes.data || [];

      setActiveIncidents(incidents.filter(i => i.status !== 'resolved'));
      setDegradedServices(services.filter(s => s.status !== 'operational'));

      setStats({
        services: services.length,
        incidents: incidents.filter(i => i.status !== 'resolved').length,
        maintenances: maintenances.filter(m => m.status !== 'completed').length,
        operational: services.filter(s => s.status === 'operational').length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handlePublishIncident = async (incidentId) => {
    try {
      await toggleIncidentVisibility(incidentId, true);
      fetchStats();
    } catch (error) {
      console.error('Error publishing incident:', error);
    }
  };

  const handleUnpublishIncident = async (incidentId) => {
    try {
      await toggleIncidentVisibility(incidentId, false);
      fetchStats();
    } catch (error) {
      console.error('Error unpublishing incident:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <h1 className={theme === 'dark' ? 'text-2xl font-semibold text-white mb-6' : 'text-2xl font-semibold text-gray-900 mb-6'}>Dashboard</h1>
        
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className={theme === 'dark' ? 'bg-[#161b22] border border-[#30363d] overflow-hidden shadow rounded-lg' : 'bg-white overflow-hidden shadow rounded-lg'}>
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={theme === 'dark' ? 'text-3xl font-bold text-[#a78bfa]' : 'text-3xl font-bold text-indigo-600'}>{stats.services}</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className={theme === 'dark' ? 'text-sm font-medium text-gray-400 truncate' : 'text-sm font-medium text-gray-500 truncate'}>Total Services</dt>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className={theme === 'dark' ? 'bg-[#161b22] border border-[#30363d] overflow-hidden shadow rounded-lg' : 'bg-white overflow-hidden shadow rounded-lg'}>
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={theme === 'dark' ? 'text-3xl font-bold text-[#4ade80]' : 'text-3xl font-bold text-green-600'}>{stats.operational}</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className={theme === 'dark' ? 'text-sm font-medium text-gray-400 truncate' : 'text-sm font-medium text-gray-500 truncate'}>Operational</dt>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className={theme === 'dark' ? 'bg-[#161b22] border border-[#30363d] overflow-hidden shadow rounded-lg' : 'bg-white overflow-hidden shadow rounded-lg'}>
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={theme === 'dark' ? 'text-3xl font-bold text-[#f87171]' : 'text-3xl font-bold text-red-600'}>{stats.incidents}</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className={theme === 'dark' ? 'text-sm font-medium text-gray-400 truncate' : 'text-sm font-medium text-gray-500 truncate'}>Active Incidents</dt>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className={theme === 'dark' ? 'bg-[#161b22] border border-[#30363d] overflow-hidden shadow rounded-lg' : 'bg-white overflow-hidden shadow rounded-lg'}>
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={theme === 'dark' ? 'text-3xl font-bold text-[#60a5fa]' : 'text-3xl font-bold text-blue-600'}>{stats.maintenances}</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className={theme === 'dark' ? 'text-sm font-medium text-gray-400 truncate' : 'text-sm font-medium text-gray-500 truncate'}>Active Maintenances</dt>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Incidents & Degraded Services */}
        {(activeIncidents.length > 0 || degradedServices.length > 0) && (
          <div className="mt-8">
            <h2 className={theme === 'dark' ? 'text-xl font-semibold text-white mb-4' : 'text-xl font-semibold text-gray-900 mb-4'}>Active Issues</h2>
            
            {activeIncidents.length > 0 && (
              <div className={theme === 'dark' ? 'bg-[#161b22] border border-[#30363d] rounded-lg p-6 mb-4' : 'bg-white shadow rounded-lg p-6 mb-4'}>
                <h3 className={theme === 'dark' ? 'text-lg font-medium text-red-400 mb-3' : 'text-lg font-medium text-red-600 mb-3'}>🚨 Active Incidents</h3>
                <div className="space-y-3">
                  {activeIncidents.map((incident) => (
                    <div key={incident.id} className="border-l-4 border-red-500 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium">{incident.title}</div>
                          <div className={theme === 'dark' ? 'text-sm text-gray-400' : 'text-sm text-gray-600'}>{incident.description}</div>
                          <div className="flex gap-2 mt-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              incident.severity === 'critical' ? 'bg-red-100 text-red-800' :
                              incident.severity === 'major' ? 'bg-red-100 text-red-800' :
                              incident.severity === 'minor' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {incident.severity} - {incident.status}
                            </span>
                            {!incident.is_visible && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Hidden
                              </span>
                            )}
                          </div>
                        </div>
                        {!incident.is_visible ? (
                          <button
                            onClick={() => handlePublishIncident(incident.id)}
                            className="ml-4 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            Publish
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnpublishIncident(incident.id)}
                            className="ml-4 px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                          >
                            Unpublish
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {degradedServices.length > 0 && (
              <div className={theme === 'dark' ? 'bg-[#161b22] border border-[#30363d] rounded-lg p-6' : 'bg-white shadow rounded-lg p-6'}>
                <h3 className={theme === 'dark' ? 'text-lg font-medium text-yellow-400 mb-3' : 'text-lg font-medium text-yellow-600 mb-3'}>⚠️ Degraded Services</h3>
                <div className="space-y-3">
                  {degradedServices.map((service) => (
                    <div key={service.id} className="border-l-4 border-yellow-500 pl-4 py-2">
                      <div className="font-medium">{service.name}</div>
                      <div className={theme === 'dark' ? 'text-sm text-gray-400' : 'text-sm text-gray-600'}>{service.description}</div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                        service.status === 'outage' ? 'bg-red-100 text-red-800' :
                        service.status === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {service.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
