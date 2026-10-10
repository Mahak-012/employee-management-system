import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getEmployee, createEmployee, updateEmployee } from "../api/employeeApi.js";
import Loader from "../components/Loader.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

const EMPTY = { name: "", email: "", department: "", position: "", salary: "", status: "Active" };
const DEPARTMENTS = ["Engineering", "Marketing", "Sales", "Human Resources", "Finance", "Design", "Operations"];

const initials = (name = "") =>
  name.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

function validate(form) {
  const errs = {};
  if (!form.name.trim()) errs.name = "Employee name is required";
  if (!form.email.trim()) errs.email = "Email is required";
  else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errs.email = "Please enter a valid email address";
  if (!form.department) errs.department = "Department is required";
  if (!form.position.trim()) errs.position = "Position is required";
  if (form.salary === "") errs.salary = "Salary is required";
  else if (Number(form.salary) <= 0) errs.salary = "Salary must be greater than 0";
  return errs;
}

export default function EmployeeForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = isEdit ? "Edit Employee · EmployeeHub" : "Add Employee · EmployeeHub";
  }, [isEdit]);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const emp = await getEmployee(id);
        setForm({
          name: emp.name,
          email: emp.email,
          department: emp.department,
          position: emp.position,
          salary: String(emp.salary),
          status: emp.status,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);
    if (submitted) setErrors(validate(updated));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        salary: Number(form.salary),
      };
      if (isEdit) await updateEmployee(id, payload);
      else await createEmployee(payload);
      navigate("/", {
        state: {
          message: isEdit
            ? "Employee updated successfully 🎉"
            : "New employee added successfully 🎉",
        },
      });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  if (loading) return <Loader label="Loading employee..." />;

  return (
    <div className="page page-narrow">
      <Link to="/" className="back-link">← Back to Dashboard</Link>

      <div className="form-layout">
        <form className="form-card" onSubmit={handleSubmit} noValidate>
          <div className="form-header">
            <h1>{isEdit ? "Edit Employee" : "Add New Employee"}</h1>
            <p>{isEdit ? "Update the employee details below." : "Fill in the details to add a new employee."}</p>
          </div>

          {error && <div className="form-error-banner">⚠️ {error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Employee Name *</label>
              <input id="name" name="name" value={form.name} onChange={handleChange}
                placeholder="e.g. Ali Khan" className={errors.name ? "input-error" : ""} />
              {errors.name && <p className="error-text">{errors.name}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="e.g. ali@company.com" className={errors.email ? "input-error" : ""} />
              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="department">Department *</label>
              <select id="department" name="department" value={form.department} onChange={handleChange}
                className={errors.department ? "input-error" : ""}>
                <option value="">Select department</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.department && <p className="error-text">{errors.department}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="position">Position *</label>
              <input id="position" name="position" value={form.position} onChange={handleChange}
                placeholder="e.g. Frontend Developer" className={errors.position ? "input-error" : ""} />
              {errors.position && <p className="error-text">{errors.position}</p>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="salary">Monthly Salary ($) *</label>
              <input id="salary" name="salary" type="number" min="0" value={form.salary}
                onChange={handleChange} placeholder="e.g. 75000"
                className={errors.salary ? "input-error" : ""} />
              {errors.salary && <p className="error-text">{errors.salary}</p>}
            </div>
            <div className="form-group">
              <label>Employment Status *</label>
              <div className="status-toggle">
                <label className={form.status === "Active" ? "toggle-pill active-pill" : "toggle-pill"}>
                  <input type="radio" name="status" value="Active"
                    checked={form.status === "Active"} onChange={handleChange} />
                  Active
                </label>
                <label className={form.status === "Inactive" ? "toggle-pill inactive-pill" : "toggle-pill"}>
                  <input type="radio" name="status" value="Inactive"
                    checked={form.status === "Inactive"} onChange={handleChange} />
                  Inactive
                </label>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <Link to="/" className="btn btn-ghost">Cancel</Link>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              {saving ? <><span className="spinner spinner-sm" /> Saving...</> : isEdit ? "Save Changes" : "Add Employee"}
            </button>
          </div>
        </form>

        <aside className="preview-side">
          <p className="preview-title">🔍 Live Preview</p>
          <article className="preview-card">
            <div className="card-top">
              <div className="avatar">{initials(form.name) || "👤"}</div>
              <div className="card-id">
                <h3>{form.name.trim() || "Employee Name"}</h3>
                <p>{form.email.trim() || "employee@company.com"}</p>
              </div>
              <StatusBadge status={form.status} />
            </div>
            <div className="card-meta">
              <span className="meta-chip">🏢 {form.department || "Department"}</span>
              <span className="meta-chip">💼 {form.position.trim() || "Position"}</span>
            </div>
            <div className="card-salary">
              <span className="salary-value">
                {form.salary ? `$${Number(form.salary).toLocaleString()}` : "$—"}
              </span>
              <span className="salary-label">/ month</span>
            </div>
            <p className="preview-note">This is how the card appears on the dashboard ✨</p>
          </article>
        </aside>
      </div>
    </div>
  );
}