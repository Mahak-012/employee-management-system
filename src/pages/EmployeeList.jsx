import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getEmployees, deleteEmployee } from "../api/employeeApi.js";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import AnimatedNumber from "../components/AnimatedNumber.jsx";
import SkeletonCards from "../components/Skeleton.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

const initials = (name = "") =>
  name.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "👤";

const formatSalary = (n) => `$${Number(n || 0).toLocaleString()}`;

const DEPARTMENTS = ["All", "Engineering", "Marketing", "Finance", "Human Resources", "Design"];

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("All");
  const [status, setStatus] = useState("All");
  const [view, setView] = useState("grid");
  const [sortKey, setSortKey] = useState("");
  const [sortDir, setSortDir] = useState("asc");
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Dashboard · EmployeeHub";
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setEmployees(await getEmployees());
      } catch (err) {
        setError(err.message || "Unable to load employees");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (location.state?.message) {
      setToast(location.state.message);
      navigate("/", { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = employees.filter(
      (e) =>
        (!q || [e.name, e.email, e.department, e.position].some((v) =>
          String(v).toLowerCase().includes(q))) &&
        (dept === "All" || e.department === dept) &&
        (status === "All" || e.status === status)
    );
    if (sortKey) {
      list = [...list].sort((a, b) => {
        const r =
          sortKey === "salary"
            ? Number(a.salary) - Number(b.salary)
            : String(a[sortKey]).localeCompare(String(b[sortKey]));
        return sortDir === "asc" ? r : -r;
      });
    }
    return list;
  }, [employees, search, dept, status, sortKey, sortDir]);

  const stats = useMemo(() => ({
    total: employees.length,
    active: employees.filter((e) => e.status === "Active").length,
    inactive: employees.filter((e) => e.status === "Inactive").length,
    payroll: employees.reduce((s, e) => s + Number(e.salary || 0), 0),
  }), [employees]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const arrow = (key) =>
    sortKey === key ? <span className="sort-arrow">{sortDir === "asc" ? "▲" : "▼"}</span> : null;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteEmployee(toDelete.id);
      setEmployees((prev) => prev.filter((e) => e.id !== toDelete.id));
      setToast(`"${toDelete.name}" removed successfully`);
      setToDelete(null);
    } catch (err) {
      setToast(err.message || "Failed to delete employee");
    } finally {
      setDeleting(false);
    }
  };

  const hasFilters = search || dept !== "All" || status !== "All";

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">React CRUD · REST API · Task 6</p>
          <h1>Employee Dashboard</h1>
          <p className="subtitle">Create, view, update and delete employee records.</p>
        </div>
        <Link to="/employees/new" className="btn btn-primary btn-lg">+ Add Employee</Link>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-indigo">👥</div>
          <div>
            <p className="stat-value"><AnimatedNumber value={stats.total} /></p>
            <p className="stat-label">Total Employees</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-green">✅</div>
          <div>
            <p className="stat-value"><AnimatedNumber value={stats.active} /></p>
            <p className="stat-label">Active</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-red">⏸️</div>
          <div>
            <p className="stat-value"><AnimatedNumber value={stats.inactive} /></p>
            <p className="stat-label">Inactive</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-amber">💰</div>
          <div>
            <p className="stat-value"><AnimatedNumber value={stats.payroll} prefix="$" /></p>
            <p className="stat-label">Total Payroll</p>
          </div>
        </div>
      </section>

      <section className="toolbar">
        <div className="search-box">
          <span>🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, department or position..."
          />
        </div>

        <select className="filter-select" value={dept} onChange={(e) => setDept(e.target.value)}>
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d === "All" ? "All Departments" : d}</option>)}
        </select>

        <div className="segmented">
          {["All", "Active", "Inactive"].map((s) => (
            <button
              key={s}
              className={`segment ${status === s ? "segment-active" : ""}`}
              onClick={() => setStatus(s)}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="view-toggle">
          <button
            className={view === "grid" ? "vt-active" : ""}
            onClick={() => setView("grid")}
            title="Card view"
          >▦</button>
          <button
            className={view === "table" ? "vt-active" : ""}
            onClick={() => setView("table")}
            title="Table view"
          >☰</button>
        </div>
      </section>

      <p className="result-count">
        Showing {visible.length} of {employees.length} employees
      </p>

      {loading ? (
        <SkeletonCards />
      ) : error ? (
        <div className="state-box">
          <div className="state-icon">⚠️</div>
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>Try Again</button>
        </div>
      ) : visible.length === 0 ? (
        <div className="state-box empty-box">
          <div className="state-icon">📋</div>
          <h3>{hasFilters ? "No matches found" : "No employees yet"}</h3>
          <p>
            {hasFilters
              ? "Try changing your search or filters."
              : "Get started by adding your first employee."}
          </p>
          {!hasFilters && <Link to="/employees/new" className="btn btn-primary">Add Employee</Link>}
        </div>
      ) : view === "grid" ? (
        <section className="employee-grid">
          {visible.map((emp, i) => (
            <article
              key={emp.id}
              className="employee-card"
              style={{ animationDelay: `${Math.min(i, 12) * 45}ms` }}
            >
              <div className="card-top">
                <div className="avatar">{initials(emp.name)}</div>
                <div className="card-id">
                  <h3>{emp.name}</h3>
                  <p>{emp.email}</p>
                </div>
                <StatusBadge status={emp.status} />
              </div>
              <div className="card-meta">
                <span className="meta-chip">🏢 {emp.department}</span>
                <span className="meta-chip">💼 {emp.position}</span>
              </div>
              <div className="card-salary">
                <span className="salary-value">{formatSalary(emp.salary)}</span>
                <span className="salary-label">/ month</span>
              </div>
              <div className="card-actions">
                <Link to={`/employees/${emp.id}`} className="btn btn-soft">View</Link>
                <Link to={`/employees/${emp.id}/edit`} className="btn btn-soft-primary">Edit</Link>
                <button className="btn btn-soft-danger" onClick={() => setToDelete(emp)}>Delete</button>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <div className="table-card table-scroll">
          <table>
            <thead>
              <tr>
                <th className="sortable" onClick={() => toggleSort("name")}>Employee {arrow("name")}</th>
                <th className="sortable" onClick={() => toggleSort("department")}>Department {arrow("department")}</th>
                <th>Position</th>
                <th className="sortable" onClick={() => toggleSort("salary")}>Salary {arrow("salary")}</th>
                <th>Status</th>
                <th className="th-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((emp, i) => (
                <tr key={emp.id} style={{ animationDelay: `${Math.min(i, 14) * 35}ms` }}>
                  <td>
                    <div className="cell-emp">
                      <div className="avatar avatar-sm">{initials(emp.name)}</div>
                      <div>
                        <p className="cell-name">{emp.name}</p>
                        <p className="cell-sub">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>{emp.department}</td>
                  <td>{emp.position}</td>
                  <td className="cell-salary">{formatSalary(emp.salary)}</td>
                  <td><StatusBadge status={emp.status} /></td>
                  <td>
                    <div className="cell-actions">
                      <Link to={`/employees/${emp.id}`} className="icon-btn" title="View">👁️</Link>
                      <Link to={`/employees/${emp.id}/edit`} className="icon-btn" title="Edit">✏️</Link>
                      <button className="icon-btn" title="Delete" onClick={() => setToDelete(emp)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete Employee?"
        message={toDelete ? `Are you sure you want to delete "${toDelete.name}"? This action cannot be undone.` : ""}
        confirmText="Yes, Delete"
        busy={deleting}
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
      />

      {toast && <div className="toast">✅ {toast}</div>}
    </div>
  );
}