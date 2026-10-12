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

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

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

async function ensureList() {
  const cached = readCache();
  if (cached) return cached;
  await delay();
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch employees");
  const list = (await res.json()).map(normalize);
  writeCache(list);
  return list;
}

export function resetDemoData() {
  localStorage.removeItem(STORAGE_KEY);
}

export async function getEmployees() {
  return ensureList();
}

export async function getEmployee(id) {
  const list = await getEmployees();
  const emp = list.find((e) => e.id === Number(id));
  if (!emp) throw new Error("Employee not found");
  return emp;
}

/* ---------- Duplicate email check ---------- */
export async function isEmailTaken(email, excludeId = null) {
  const list = await getEmployees();
  const target = String(email).trim().toLowerCase();
  return list.some(
    (e) => String(e.email).trim().toLowerCase() === target && e.id !== excludeId
  );
}

export async function createEmployee(employee) {
  await delay();

  // Best-effort sync with mock API (it never stores our data — that's fine)
  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employee),
    });
  } catch {}

  const list = await ensureList();
  const created = {
    ...employee,
    id: list.reduce((m, e) => Math.max(m, e.id), 0) + 1,
  };
  writeCache([...list, created]);
  return created;
}

export async function updateEmployee(id, employee) {
  await delay();
  const empId = Number(id);
  const list = await ensureList();

  if (!list.some((e) => e.id === empId)) {
    throw new Error("Employee not found");
  }

  
  try {
    await fetch(`${API_URL}/${empId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employee),
    });
  } catch {}

  const updated = { ...employee, id: empId };
  writeCache(list.map((e) => (e.id === empId ? updated : e)));
  return updated;
}

export async function deleteEmployee(id) {
  await delay();
  const empId = Number(id);
  const list = await ensureList();

  if (!list.some((e) => e.id === empId)) {
    throw new Error("Employee not found");
  }

  // Same as update: ignore mock API 404 for locally created records
  try {
    await fetch(`${API_URL}/${empId}`, { method: "DELETE" });
  } catch {}

  writeCache(list.filter((e) => e.id !== empId));
  return empId;
}