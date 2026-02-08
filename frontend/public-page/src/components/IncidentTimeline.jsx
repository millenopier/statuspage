export default function IncidentTimeline({ incidents }) {
  const activeIncidents = incidents.filter(i => i.status !== 'resolved');
  
  if (!activeIncidents || activeIncidents.length === 0) return null;

  const severityColors = {
    critical: 'border-red-500',
    major: 'border-orange-500',
    minor: 'border-yellow-500',
    info: 'border-blue-500'
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Active Incidents</h3>
      <div className="space-y-4">
        {activeIncidents.map((incident) => (
          <div key={incident.id} className={`bg-[#161b22] border-l-4 ${severityColors[incident.severity]} border-r border-t border-b border-[#30363d] rounded-r-lg p-4`}>
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold">{incident.title}</h4>
              <span className="text-xs text-gray-400">{formatDate(incident.created_at)}</span>
            </div>
            <p className="text-sm text-gray-300 mb-3">{incident.description}</p>
            {incident.updates && incident.updates.length > 0 && (
              <div className="space-y-2 border-t border-[#30363d] pt-3">
                {incident.updates.map((update) => (
                  <div key={update.id} className="text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-blue-500">{update.status}</span>
                      <span className="text-gray-400">{formatDate(update.created_at)}</span>
                    </div>
                    <p className="text-gray-300 mt-1">{update.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
