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
    throw new Error("Usuario o contraseña incorrectos");
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

export function hardDeleteService(serviceId) {
  return request(`/services/${serviceId}/hard`, {
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

export function hardDeletePurchase(purchaseId) {
  return request(`/purchases/${purchaseId}/hard`, {
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

export function hardDeleteSale(saleId) {
  return request(`/sales/${saleId}/hard`, {
    method: "DELETE",
  });
}

export function getUsers() {
  return request("/users");
}

export function createUser(user) {
  return request("/users", {
    method: "POST",
    body: JSON.stringify(user),
  });
}

export function updateUser(userId, user) {
  return request(`/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(user),
  });
}

export function deactivateUser(userId) {
  return request(`/users/${userId}`, {
    method: "DELETE",
  });
}

export function hardDeleteUser(userId) {
  return request(`/users/${userId}/hard`, {
    method: "DELETE",
  });
}

export function getRoles() {
  return request("/roles");
}

export function getReportSummary() {
  return request("/reports/summary");
}

export function getGuests() {
  return request("/guests");
}

export function createGuest(guest) {
  return request("/guests", {
    method: "POST",
    body: JSON.stringify(guest),
  });
}

export function updateGuest(guestId, guest) {
  return request(`/guests/${guestId}`, {
    method: "PUT",
    body: JSON.stringify(guest),
  });
}

export function deactivateGuest(guestId) {
  return request(`/guests/${guestId}`, {
    method: "DELETE",
  });
}

export function hardDeleteGuest(guestId) {
  return request(`/guests/${guestId}/hard`, {
    method: "DELETE",
  });
}

export function reactivateGuest(guestId) {
  return request(`/guests/${guestId}`, {
    method: "PUT",
    body: JSON.stringify({ is_active: true }),
  });
}

export function reactivateUser(userId) {
  return request(`/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify({ is_active: true }),
  });
}

export async function extractOCR(file) {
  const token = getToken();
  const body = new FormData();
  body.append("file", file);

  const response = await fetch(`${API_URL}/ocr/extract`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body,
  });

  if (!response.ok) {
    let message = "Error al procesar OCR";
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

export async function extractOCRMultiple(files) {
  const token = getToken();
  const body = new FormData();
  files.forEach((file) => body.append("files", file));

  const response = await fetch(`${API_URL}/ocr/extract-multiple`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body,
  });

  if (!response.ok) {
    let message = "Error al procesar OCR";
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

export { API_URL, TOKEN_KEY };
