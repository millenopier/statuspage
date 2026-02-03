import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getSubscribers, deleteSubscriber } from '../services/api';
import { useThemeStore } from '../contexts/themeStore';

export default function Subscribers() {
  const theme = useThemeStore((state) => state.theme);
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const res = await getSubscribers();
      setSubscribers(res.data || []);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this subscriber?')) return;
    try {
      await deleteSubscriber(id);
      fetchSubscribers();
    } catch (error) {
      alert('Failed to delete subscriber');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) return <Layout><div className="p-4">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className={theme === 'dark' ? 'text-2xl font-semibold text-white' : 'text-2xl font-semibold text-gray-900'}>Subscribers</h1>
          <div className={theme === 'dark' ? 'text-sm text-gray-400' : 'text-sm text-gray-600'}>
            Total: {subscribers.length} ({subscribers.filter(s => s.is_active).length} active)
          </div>
        </div>

        <div className={theme === 'dark' ? 'bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden' : 'bg-white shadow overflow-hidden rounded-lg'}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={theme === 'dark' ? 'bg-[#0d1117]' : 'bg-gray-50'}>
              <tr>
                <th className={theme === 'dark' ? 'px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider' : 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'}>Email</th>
                <th className={theme === 'dark' ? 'px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider' : 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'}>Status</th>
                <th className={theme === 'dark' ? 'px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider' : 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'}>Subscribed At</th>
                <th className={theme === 'dark' ? 'px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider' : 'px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'}>Actions</th>
              </tr>
            </thead>
            <tbody className={theme === 'dark' ? 'divide-y divide-[#30363d]' : 'bg-white divide-y divide-gray-200'}>
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id}>
                  <td className={theme === 'dark' ? 'px-6 py-4 whitespace-nowrap text-sm text-white' : 'px-6 py-4 whitespace-nowrap text-sm text-gray-900'}>{subscriber.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={subscriber.is_active ? 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800' : 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800'}>
                      {subscriber.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className={theme === 'dark' ? 'px-6 py-4 whitespace-nowrap text-sm text-gray-400' : 'px-6 py-4 whitespace-nowrap text-sm text-gray-500'}>{formatDate(subscriber.created_at)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleDelete(subscriber.id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
