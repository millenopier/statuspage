import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';

export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    const unsubscribe = async () => {
      try {
        await api.get(`/public/unsubscribe?token=${token}`);
        setStatus('success');
      } catch (error) {
        setStatus('error');
      }
    };

    unsubscribe();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="text-4xl mb-4">⏳</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing...</h1>
            <p className="text-gray-600">Please wait while we unsubscribe you.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="text-4xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Successfully Unsubscribed</h1>
            <p className="text-gray-600 mb-6">You will no longer receive maintenance notifications.</p>
            <a href="/" className="text-blue-600 hover:text-blue-700 font-medium">
              Return to Status Page
            </a>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="text-4xl mb-4">✗</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Unsubscribe Failed</h1>
            <p className="text-gray-600 mb-6">Invalid or expired unsubscribe link.</p>
            <a href="/" className="text-blue-600 hover:text-blue-700 font-medium">
              Return to Status Page
            </a>
          </>
        )}
      </div>
    </div>
  );
}
