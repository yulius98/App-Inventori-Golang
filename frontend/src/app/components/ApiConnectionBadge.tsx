'use client';

interface Props {
  status: 'checking...' | 'connected' | 'disconnected' | 'error' | string;
  className?: string;
}

export default function ApiConnectionBadge({ status, className = '' }: Props) {
  const colorClass =
    status === 'connected'
      ? 'text-green-600'
      : status === 'disconnected'
      ? 'text-red-600'
      : 'text-yellow-600';

  return (
    <div className={`mb-4 p-3 rounded bg-gray-100 ${className}`}>
      <span className="font-semibold">API Connection: </span>
      <span className={`capitalize ${colorClass}`}>{status}</span>
      {status === 'disconnected' && (
        <span className="ml-2 text-sm text-gray-600">
          (Server offline - Please start Go backend server on port 8080)
        </span>
      )}
    </div>
  );
}
