
import React from "react";
import { useAuth } from "../../contexts/AuthContext"; // Adjust the import path as necessary

// Define possible roles (align with AuthContext and specs)
type Role = 'admin' | 'elu' | 'agent_technique' | 'dgs' | 'citoyen' | string; // Allow string for flexibility

/**
 * Checks if the current user has at least one of the required roles.
 * 
 * @param requiredRoles - An array of roles required to access a resource.
 * @returns boolean - True if the user has one of the required roles, false otherwise.
 */
export const useCheckRole = (requiredRoles: Role[]): boolean => {
  const { user } = useAuth();

  if (!user || !user.role) {
    return false; // Not authenticated or role not defined
  }

  // Check if the user's role is included in the required roles
  return requiredRoles.includes(user.role);
};

/**
 * Placeholder for a Higher-Order Component (HOC) to protect routes/components based on roles.
 * This would typically wrap components or pages.
 */
export const withRoleProtection = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredRoles: Role[]
) => {
  const ComponentWithRoleProtection: React.FC<P> = (props) => {
    const hasRequiredRole = useCheckRole(requiredRoles);

    if (!hasRequiredRole) {
      // TODO: Implement proper handling for unauthorized access
      // e.g., redirect to an unauthorized page or show a message
      return <div>Accès non autorisé.</div>; 
    }

    return <WrappedComponent {...props} />;
  };

  return ComponentWithRoleProtection;
};

// Example usage (conceptual):
// const ProtectedPage = withRoleProtection(MyPageComponent, ["admin", "elu"]);

