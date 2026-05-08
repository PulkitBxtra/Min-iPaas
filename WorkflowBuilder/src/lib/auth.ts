import { CREDENTIALS, AUTH_STORAGE_KEY } from './constants';

export function login(email: string, password: string): boolean {
  if (email === CREDENTIALS.email && password === CREDENTIALS.password) {
    localStorage.setItem(AUTH_STORAGE_KEY, 'true');
    return true;
  }
  return false;
}

export function logout(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function isAuthenticated(): boolean {
  return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
}
