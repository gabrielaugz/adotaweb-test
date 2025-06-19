import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  if (!token) {
    // se não tem token, manda pro login
    return <Navigate to="/admin/login" replace />
  }
  return children
}
