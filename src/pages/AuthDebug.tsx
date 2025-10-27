import { useAuth } from '../contexts/AuthContext'

export const AuthDebug = () => {
  const { user, loading, session } = useAuth()

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Auth Debug Page</h1>

        <div className="space-y-4">
          <div>
            <h2 className="font-semibold">Loading State:</h2>
            <p className="text-gray-600">{loading ? 'Loading...' : 'Ready'}</p>
          </div>

          <div>
            <h2 className="font-semibold">User State:</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {user ? JSON.stringify(user, null, 2) : 'No user (unauthenticated)'}
            </pre>
          </div>

          <div>
            <h2 className="font-semibold">Session State:</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {session ? JSON.stringify(session, null, 2) : 'No session'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
