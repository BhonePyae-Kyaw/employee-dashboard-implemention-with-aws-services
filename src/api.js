const API_URL = import.meta.env.VITE_API_URL;

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message || `Request failed: ${response.status}`);
  }
  return data;
}

export const listEmployees = () => request("");

export const createEmployee = (employee) =>
  request("", { method: "POST", body: JSON.stringify(employee) });

export const updateEmployee = (empNo, changes) =>
  request(`/${empNo}`, { method: "PUT", body: JSON.stringify(changes) });

export const deleteEmployee = (empNo) =>
  request(`/${empNo}`, { method: "DELETE" });
