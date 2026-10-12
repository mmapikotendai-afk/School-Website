export default function AdminLoading() {
  return <div className="admin-loading" role="status" aria-live="polite">
    <span className="sr-only">Loading administration page…</span>
    <div className="admin-loading-title" aria-hidden="true"/>
    <div className="admin-loading-toolbar" aria-hidden="true"/>
    <div className="admin-loading-panel" aria-hidden="true">
      <span/><span/><span/><span/>
    </div>
  </div>;
}
