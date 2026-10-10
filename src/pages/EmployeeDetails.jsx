import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getEmployee, deleteEmployee } from "../api/employeeApi.js";
import Loader from "../components/Loader.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    document.title = "Employee Details · EmployeeHub";
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setEmployee(await getEmployee(id));
      } catch (err) {
        setError(err.message || "Failed to load employee");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteEmployee(employee.id);
      navigate("/", { state: { message: `"${employee.name}" removed successfully` } });
    } catch (err) {
      setDeleting(false);
      setConfirmOpen(false);
      setError(err.message || "Failed to delete employee");
    }
  };

  if (loading) return <Loader label="Loading employee details..." />;

  if (error)
    return (
      <div className="page">
        <div className="state-box">
          <div className="state-icon">⚠️</div>
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <Link to="/" className="btn btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    );

  const initials =
    employee.name.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="page page-narrow">
      <Link to="/" className="back-link">← Back to Dashboard</Link>

      <div className="details-hero">
        <div className="avatar avatar-lg">{initials}</div>
        <div>
          <h1>{employee.name}</h1>
          <p>{employee.email}</p>
        </div>
        <StatusBadge status={employee.status} />
      </div>

      <div className="details-grid">
        <div className="detail-tile">
          <p className="detail-label">Department</p>
          <p className="detail-value">🏢 {employee.department}</p>
        </div>
        <div className="detail-tile">
          <p className="detail-label">Position</p>
          <p className="detail-value">💼 {employee.position}</p>
        </div>
        <div className="detail-tile">
          <p className="detail-label">Monthly Salary</p>
          <p className="detail-value detail-salary">💰 ${Number(employee.salary).toLocaleString()}</p>
        </div>
        <div className="detail-tile">
          <p className="detail-label">Employee ID</p>
          <p className="detail-value">🆔 #{employee.id}</p>
        </div>
        <div className="detail-tile">
          <p className="detail-label">Email</p>
          <p className="detail-value">📧 {employee.email}</p>
        </div>
        <div className="detail-tile">
          <p className="detail-label">Employment Status</p>
          <p className="detail-value">
            {employee.status === "Active" ? "✅" : "⏸️"} {employee.status}
          </p>
        </div>
      </div>

      <div className="details-actions">
        <button className="btn btn-soft-danger" onClick={() => setConfirmOpen(true)}>🗑️ Delete</button>
        <Link to={`/employees/${employee.id}/edit`} className="btn btn-primary">✏️ Edit Employee</Link>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Employee?"
        message={`Are you sure you want to delete "${employee.name}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        busy={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}