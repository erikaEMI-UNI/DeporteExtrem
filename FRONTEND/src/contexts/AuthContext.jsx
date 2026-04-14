import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getMe, login as apiLogin } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true); // Inicia como true para la carga inicial
  const [error, setError] = useState(null);

  const fetchUserData = useCallback(async (currentToken) => {
    if (!currentToken) {
      setUser(null);
      setToken(null);
      localStorage.removeItem('authToken');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const userData = await getMe(currentToken);
      setUser(userData);
      setToken(currentToken);
      localStorage.setItem('authToken', currentToken);
    } catch (err) {
      console.error("Error al obtener datos del usuario:", err);
      setError(err.message);
      setUser(null);
      setToken(null);
      localStorage.removeItem('authToken');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const tokenInStorage = localStorage.getItem('authToken');
    if (tokenInStorage) {
      fetchUserData(tokenInStorage);
    } else {
      setLoading(false); // No hay token, no hay nada que cargar
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUserData]); // fetchUserData está memoizado con useCallback

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiLogin(email, password);
      if (data.token) {
        await fetchUserData(data.token); // Esto setea el token en localStorage y el estado
      } else {
        throw new Error("No se recibió token del servidor.");
      }
      return true; // Login exitoso
    } catch (err) {
      console.error("Error en login:", err);
      setError(err.message);
      setUser(null);
      setToken(null);
      localStorage.removeItem('authToken');
      setLoading(false);
      throw err; // Re-lanza el error para que el LoginPage lo maneje
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    setError(null);
    // Opcional: redirigir aquí o dejar que el componente lo haga
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout, loading, error, setError, fetchUserData }}>
      {children}
    </AuthContext.Provider>
  );
};
