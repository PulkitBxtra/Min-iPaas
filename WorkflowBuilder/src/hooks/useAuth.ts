import { useState } from 'react';
import { login as authLogin, logout as authLogout, isAuthenticated } from '@/lib/auth';

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated);

  function login(email: string, password: string): boolean {
    const ok = authLogin(email, password);
    if (ok) setIsLoggedIn(true);
    return ok;
  }

  function logout() {
    authLogout();
    setIsLoggedIn(false);
  }

  return { isLoggedIn, login, logout };
}
