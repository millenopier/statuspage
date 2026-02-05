import { useThemeStore } from '../contexts/themeStore';

export default function HistorySection({ incidents }) {
  const theme = useThemeStore((state) => state.theme);
  
  const formatDate = (date) => {
    return new Date(date).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const resolvedIncidents = incidents.filter(i => i.status === 'resolved').slice(0, 10);

  if (resolvedIncidents.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Recent History</h3>
      
      {resolvedIncidents.length > 0 && (
        <div className={theme === 'dark' ? 'bg-[#161b22] border border-[#30363d] rounded-lg p-6' : 'bg-white border border-gray-200 rounded-lg p-6 shadow-sm'}>
          <h4 className={theme === 'dark' ? 'text-md font-semibold mb-3 text-green-400' : 'text-md font-semibold mb-3 text-green-600'}>✓ Resolved Incidents</h4>
          <div className="space-y-3">
            {resolvedIncidents.map((incident) => (
              <div key={incident.id} className="border-l-2 border-green-500 pl-4 py-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{incident.title}</div>
                    <div className={theme === 'dark' ? 'text-sm text-gray-400' : 'text-sm text-gray-600'}>{incident.description}</div>
                  </div>
                  <div className={theme === 'dark' ? 'text-xs text-gray-500' : 'text-xs text-gray-500'}>{formatDate(incident.resolved_at || incident.updated_at)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
