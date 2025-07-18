import { useAuth } from '@/lib/auth/AuthContext';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  fallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  fallback = <div>Access Denied</div>,
}: ProtectedRouteProps) {
  const { isAuthenticated, hasRole, hasPermission } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in to access this page</div>;
  }

  if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    return fallback;
  }

  for (const permission of requiredPermissions) {
    if (!hasPermission(permission)) {
      return fallback;
    }
  }

  return <>{children}</>;
}

// Permission-based component visibility
export function PermissionGate({
  children,
  permission,
  fallback = null,
}: {
  children: ReactNode;
  permission: string;
  fallback?: ReactNode;
}) {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
