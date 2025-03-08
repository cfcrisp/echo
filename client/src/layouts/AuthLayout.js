import { Outlet, Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

function AuthLayout() {
  const { user } = useAuth()

  // Redirect if user is already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="rounded-md bg-primary-500 p-2">
            <span className="text-xl font-bold text-white">E</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">Echo</h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">Customer Request Tracking System</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AuthLayout