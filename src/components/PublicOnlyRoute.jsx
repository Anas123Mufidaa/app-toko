import { Navigate } from 'react-router-dom';
import { hasAuthSession } from '../service/auth-storage.js';

function PublicOnlyRoute({ children }) {
  if (hasAuthSession()) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default PublicOnlyRoute;
