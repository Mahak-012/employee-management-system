const API_URL = "https://jsonplaceholder.typicode.com/users";
const STORAGE_KEY = "ems_employees_v1";

const DEMO_DEPARTMENTS = ["Engineering", "Marketing", "Finance", "Human Resources", "Design"];
const DEMO_POSITIONS = ["Software Engineer", "Product Designer", "QA Engineer", "DevOps Engineer", "Business Analyst"];

const normalize = (u) => ({
  id: u.id,
  name: u.name || "",
  email: u.email || "",
  department: u.department || DEMO_DEPARTMENTS[u.id % DEMO_DEPARTMENTS.length],
  position: u.position || DEMO_POSITIONS[u.id % DEMO_POSITIONS.length],
  salary: Number(u.salary) || 45000 + u.id * 3500,
  status: u.status || (u.id % 4 === 0 ? "Inactive" : "Active"),
});

const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms));

function readCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

export function resetDemoData() {
  localStorage.removeItem(STORAGE_KEY);
}

export async function getEmployees() {
  const cached = readCache();
  if (cached) return cached;
  await delay();
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch employees");
  const data = await res.json();
  const list = data.map(normalize);
  writeCache(list);
  return list;
}

export async function getEmployee(id) {
  const list = await getEmployees();
  const emp = list.find((e) => e.id === Number(id));
  if (!emp) throw new Error("Employee not found");
  return emp;
}

export async function createEmployee(employee) {
  await delay();
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(employee),
  });
  if (!res.ok) throw new Error("Failed to create employee");
  const list = readCache() || [];
  const created = { ...employee, id: list.reduce((m, e) => Math.max(m, e.id), 0) + 1 };
  writeCache([...list, created]);
  return created;
}

export async function updateEmployee(id, employee) {
  await delay();
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(employee),
  });
  if (!res.ok) throw new Error("Failed to update employee");
  const list = readCache() || [];
  const updated = { ...employee, id: Number(id) };
  writeCache(list.map((e) => (e.id === updated.id ? updated : e)));
  return updated;
}

export async function deleteEmployee(id) {
  await delay();
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete employee");
  const list = readCache() || [];
  writeCache(list.filter((e) => e.id !== Number(id)));
  return Number(id);
}