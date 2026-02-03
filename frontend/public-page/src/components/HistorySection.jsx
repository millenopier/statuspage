export default function HistorySection({ incidents, maintenances }) {
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
  const completedMaintenances = maintenances.filter(m => m.status === 'completed').slice(0, 10);

  if (resolvedIncidents.length === 0 && completedMaintenances.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Recent History</h3>
      
      {resolvedIncidents.length > 0 && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 mb-4">
          <h4 className="text-md font-semibold mb-3 text-green-400">✓ Resolved Incidents</h4>
          <div className="space-y-3">
            {resolvedIncidents.map((incident) => (
              <div key={incident.id} className="border-l-2 border-green-500 pl-4 py-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{incident.title}</div>
                    <div className="text-sm text-gray-400">{incident.description}</div>
                  </div>
                  <div className="text-xs text-gray-500">{formatDate(incident.resolved_at || incident.updated_at)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {completedMaintenances.length > 0 && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
          <h4 className="text-md font-semibold mb-3 text-blue-400">✓ Completed Maintenances</h4>
          <div className="space-y-3">
            {completedMaintenances.map((maintenance) => (
              <div key={maintenance.id} className="border-l-2 border-blue-500 pl-4 py-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{maintenance.title}</div>
                    <div className="text-sm text-gray-400">{maintenance.description}</div>
                  </div>
                  <div className="text-xs text-gray-500">{formatDate(maintenance.scheduled_end)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
