export default function ErrorState({ message, onRetry }) {
  return (
    <div className="state-box">
      <div className="state-icon">⚠️</div>
      <h3>Something went wrong</h3>
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn-primary" onClick={onRetry}>Try Again</button>
      )}
    </div>
  );
}