export default function AppCard({ app, onDelete, onToggle }) {
  const lastLog = app.logs?.[0]
  const isOnline = lastLog?.ok
  
  const formatDate = (date) => {
    return new Date(date).toLocaleString()
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">{app.name}</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className={`text-sm font-medium ${isOnline ? 'text-green-700' : 'text-red-700'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        <p><span className="font-medium">URL:</span> {app.url}</p>
        <p><span className="font-medium">Interval:</span> {app.intervalMin} minutes</p>
        {app.lastPingAt && (
          <p><span className="font-medium">Last ping:</span> {formatDate(app.lastPingAt)}</p>
        )}
        {lastLog && (
          <p><span className="font-medium">Status:</span> {lastLog.status} ({lastLog.duration}ms)</p>
        )}
      </div>
      
      <div className="mt-4 flex space-x-2">
        <button
          onClick={() => onToggle(app.id, !app.isActive)}
          className={`px-3 py-1 text-xs rounded ${
            app.isActive 
              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              : 'bg-green-100 text-green-800 hover:bg-green-200'
          }`}
        >
          {app.isActive ? 'Pause' : 'Resume'}
        </button>
        <button
          onClick={() => onDelete(app.id)}
          className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
        >
          Delete
        </button>
      </div>
    </div>
  )
}