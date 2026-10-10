export default function StatusBadge({ status }) {
  return (
    <span className={`badge ${status === "Active" ? "badge-active" : "badge-inactive"}`}>
      <span className="badge-dot" />
      {status}
    </span>
  );
}