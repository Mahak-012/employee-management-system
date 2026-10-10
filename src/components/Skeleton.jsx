export default function SkeletonCards({ count = 6 }) {
  return (
    <div className="employee-grid" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="sk-row">
            <div className="sk sk-avatar" />
            <div className="sk-lines">
              <div className="sk sk-line" style={{ width: "70%" }} />
              <div className="sk sk-line" style={{ width: "45%" }} />
            </div>
          </div>
          <div className="sk sk-line" style={{ width: "55%" }} />
          <div className="sk sk-block" />
          <div className="sk sk-line" style={{ width: "100%", height: 36 }} />
        </div>
      ))}
    </div>
  );
}