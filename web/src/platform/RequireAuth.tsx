import { Navigate } from "react-router-dom";
import { useAuth } from "./stores/auth.js";

export function RequireAuth({ children }: { children: React.ReactNode }): JSX.Element {
  const token = useAuth((s) => s.token);
  const expiresAt = useAuth((s) => s.expiresAt);
  if (!token || !expiresAt || expiresAt <= Date.now()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
