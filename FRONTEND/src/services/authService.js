// Usa el proxy de Vite (/api → http://localhost:3000/api)
// igual que el resto de servicios del proyecto

const BASE = "/api";

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      data.message || data.error || data.msg || `Error ${res.status}`
    );
  }
  return data;
};

export const login = async (email, password) => {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
};

export const getMe = async (token) => {
  const res = await fetch(`${BASE}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (res.status === 401) {
    throw new Error("Token inválido o expirado. Por favor, inicia sesión de nuevo.");
  }
  return handleResponse(res);
};

export const register = async (email, password, name, ci, celular) => {
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name, ci, celular }),
  });
  return handleResponse(res);
};
