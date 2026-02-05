import { useState } from 'react';
import { useThemeStore } from '../contexts/themeStore';
import { api } from '../services/api';

export default function SubscribeForm() {
  const theme = useThemeStore((state) => state.theme);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      await api.post('/public/subscribe', { email });
      setStatus('success');
      setEmail('');
      setTimeout(() => setShowModal(false), 2000);
    } catch (error) {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-6 py-2 bg-[#3b82f6] text-white font-medium rounded-md hover:bg-[#2563eb] transition-all shadow-sm hover:shadow-md flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        Subscribe to Updates
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div 
            className={theme === 'dark' ? 'bg-[#161b22] border border-[#30363d] rounded-lg p-6 max-w-md w-full mx-4' : 'bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl'}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Subscribe to Updates</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className={theme === 'dark' ? 'text-sm text-gray-400 mb-4' : 'text-sm text-gray-600 mb-4'}>
              Get notified about scheduled maintenances via email.
            </p>
            
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className={theme === 'dark' 
                  ? 'w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4' 
                  : 'w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4'}
              />
              
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-[#3b82f6] text-white font-medium rounded-md hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
              >
                {loading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>

            {status === 'success' && (
              <p className="mt-3 text-sm text-green-500">✓ Successfully subscribed!</p>
            )}
            {status === 'error' && (
              <p className="mt-3 text-sm text-red-500">✗ Failed to subscribe. Please try again.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
