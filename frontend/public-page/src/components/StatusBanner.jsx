export default function StatusBanner({ status }) {
  const statusConfig = {
    operational: {
      bg: 'bg-green-900/30',
      border: 'border-green-500',
      text: 'text-green-400',
      icon: '✓',
      message: 'All Systems Operational'
    },
    degraded: {
      bg: 'bg-yellow-900/30',
      border: 'border-yellow-500',
      text: 'text-yellow-400',
      icon: '!',
      message: 'Partial System Outage'
    },
    outage: {
      bg: 'bg-red-900/30',
      border: 'border-red-500',
      text: 'text-red-400',
      icon: '×',
      message: 'Major System Outage'
    }
  };

  const config = statusConfig[status] || statusConfig.operational;

  return (
    <div className={`${config.bg} border ${config.border} rounded-lg p-6 mb-8`}>
      <div className="flex items-center gap-3">
        <span className={`${config.text} text-2xl font-bold`}>{config.icon}</span>
        <h2 className={`${config.text} text-xl font-semibold`}>{config.message}</h2>
      </div>
    </div>
  );
}
