import { Navigate } from 'react-router-dom';
import { hasAuthSession } from '../service/auth-storage.js';

function ProtectedRoute({ children }) {
  if (!hasAuthSession()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
