const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const TOKEN_KEY = "hostal_la_torre_token";

export async function getHealth() {
  const response = await fetch(`${API_URL}/health`);
  return response.json();
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function login(username, password) {
  const body = new URLSearchParams();
  body.append("username", username);
  body.append("password", password);

  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    throw new Error("Usuario o contrasena incorrectos");
  }

  return response.json();
}

export async function getCurrentUser(token = getToken()) {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Sesion no valida");
  }

  return response.json();
}

async function request(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = "Error al procesar la solicitud";
    try {
      const error = await response.json();
      message = error.detail ?? message;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  return response.json();
}

export function getServices() {
  return request("/services");
}

export function createService(service) {
  return request("/services", {
    method: "POST",
    body: JSON.stringify(service),
  });
}

export function updateService(serviceId, service) {
  return request(`/services/${serviceId}`, {
    method: "PUT",
    body: JSON.stringify(service),
  });
}

export function deactivateService(serviceId) {
  return request(`/services/${serviceId}`, {
    method: "DELETE",
  });
}

export function getPurchases() {
  return request("/purchases");
}

export function createPurchase(purchase) {
  return request("/purchases", {
    method: "POST",
    body: JSON.stringify(purchase),
  });
}

export function updatePurchase(purchaseId, purchase) {
  return request(`/purchases/${purchaseId}`, {
    method: "PUT",
    body: JSON.stringify(purchase),
  });
}

export function cancelPurchase(purchaseId) {
  return request(`/purchases/${purchaseId}`, {
    method: "DELETE",
  });
}

export function getSales() {
  return request("/sales");
}

export function createSale(sale) {
  return request("/sales", {
    method: "POST",
    body: JSON.stringify(sale),
  });
}

export function updateSale(saleId, sale) {
  return request(`/sales/${saleId}`, {
    method: "PUT",
    body: JSON.stringify(sale),
  });
}

export function cancelSale(saleId) {
  return request(`/sales/${saleId}`, {
    method: "DELETE",
  });
}

export { API_URL, TOKEN_KEY };
