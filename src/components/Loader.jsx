export default function Loader({ label = "Loading employees..." }) {
  return (
    <div className="loader-wrap">
      <span className="spinner" />
      <p>{label}</p>
    </div>
  );
}