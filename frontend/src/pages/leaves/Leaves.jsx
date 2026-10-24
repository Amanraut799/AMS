import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAllLeaves, getMyLeaves, requestLeave, reviewLeave } from "../../services/api";

const initialForm = { startDate: "", endDate: "", leaveType: "CASUAL", reason: "" };

function Leaves() {
  const { token, user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const home = isAdmin ? "/admin" : "/employee";
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true); setError("");
      setLeaves(isAdmin ? await getAllLeaves(token) : await getMyLeaves(token));
    } catch (err) { setError(err.response?.data?.message || "Unable to load leave requests."); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [isAdmin, token]);

  async function submitRequest(event) {
    event.preventDefault(); setSubmitting(true); setMessage(""); setError("");
    try {
      await requestLeave(token, form);
      setForm(initialForm); setMessage("Leave request submitted for admin review."); await load();
    } catch (err) { setError(err.response?.data?.message || "Unable to submit this leave request."); }
    finally { setSubmitting(false); }
  }

  async function decide(leave, status) {
    const note = status === "REJECTED" ? window.prompt("Optional reason for rejecting this request:") : "";
    if (status === "REJECTED" && note === null) return;
    if (!window.confirm(`${status === "APPROVED" ? "Approve" : "Reject"} leave for ${leave.employee.firstName} ${leave.employee.lastName} from ${leave.startDate} through ${leave.endDate}?`)) return;
    setSavingId(leave.id); setError(""); setMessage("");
    try { await reviewLeave(token, leave.id, status, note || ""); setMessage(`Leave request ${status.toLowerCase()}.`); await load(); }
    catch (err) { setError(err.response?.data?.message || "Unable to review this request."); }
    finally { setSavingId(null); }
  }

  const visibleLeaves = leaves.filter((leave) => filter === "ALL" || leave.status === filter);
  const currentDate = new Date();
  const today = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

  return <main style={styles.page}>
    <header style={styles.header}><div><h1 style={styles.title}>{isAdmin ? "Leave requests" : "My leave"}</h1><p style={styles.muted}>{isAdmin ? "Review and track employee leave requests." : "Request time off and check its approval status."}</p></div><Link to={home} style={styles.back}>← Dashboard</Link></header>
    {message && <div role="status" style={styles.success}>{message}</div>}{error && <div role="alert" style={styles.error}>{error}</div>}

    {!isAdmin && <section style={styles.panel}>
      <h2 style={styles.heading}>Request leave</h2>
      <p style={styles.muted}>Your request remains pending until an administrator reviews it. Approved leave is excluded from expected attendance.</p>
      <form onSubmit={submitRequest}>
        <div style={styles.grid}>
          <label style={styles.field}>Leave type<select value={form.leaveType} onChange={(e) => setForm({ ...form, leaveType: e.target.value })} style={styles.input}><option value="CASUAL">Casual</option><option value="SICK">Sick</option><option value="UNPAID">Unpaid</option><option value="OTHER">Other</option></select></label>
          <label style={styles.field}>From<input type="date" min={today} required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value, endDate: form.endDate && form.endDate < e.target.value ? e.target.value : form.endDate })} style={styles.input} /></label>
          <label style={styles.field}>Through<input type="date" min={form.startDate || today} required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} style={styles.input} /></label>
          <label style={{ ...styles.field, gridColumn: "1 / -1" }}>Reason<textarea required maxLength="1000" rows="3" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Briefly explain the request" style={{ ...styles.input, resize: "vertical" }} /></label>
        </div>
        <div style={styles.actions}><button disabled={submitting} style={styles.primary}>{submitting ? "Submitting…" : "Submit request"}</button></div>
      </form>
    </section>}

    <section style={styles.panel}>
      <div style={styles.listHeader}><div><h2 style={styles.heading}>{isAdmin ? "Requests" : "Request history"}</h2><p style={styles.muted}>{visibleLeaves.length} request{visibleLeaves.length === 1 ? "" : "s"}</p></div><label style={styles.filter}>Status<select value={filter} onChange={(e) => setFilter(e.target.value)} style={styles.filterInput}><option value="ALL">All</option><option value="PENDING">Pending</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option></select></label></div>
      {loading ? <p style={styles.empty}>Loading leave requests…</p> : visibleLeaves.length === 0 ? <p style={styles.empty}>No leave requests found.</p> : <div style={styles.tableWrap}><table style={styles.table}><thead><tr>{isAdmin && <th style={styles.th}>Employee</th>}<th style={styles.th}>Dates</th><th style={styles.th}>Type</th><th style={styles.th}>Reason</th><th style={styles.th}>Status</th><th style={styles.th}>Admin note</th>{isAdmin && <th style={styles.th}>Action</th>}</tr></thead><tbody>{visibleLeaves.map((leave) => <tr key={leave.id}>{isAdmin && <td style={styles.td}><strong>{leave.employee.firstName} {leave.employee.lastName}</strong><small style={styles.small}>{leave.employee.employeeCode} · {leave.employee.email}</small></td>}<td style={styles.td}>{leave.startDate}{leave.endDate !== leave.startDate ? ` – ${leave.endDate}` : ""}</td><td style={styles.td}>{leave.leaveType}</td><td style={{ ...styles.td, whiteSpace: "normal", minWidth: 180 }}>{leave.reason}</td><td style={styles.td}><span style={statusStyle(leave.status)}>{leave.status}</span></td><td style={{ ...styles.td, whiteSpace: "normal" }}>{leave.reviewerNote || "-"}</td>{isAdmin && <td style={styles.td}>{leave.status === "PENDING" ? <div style={styles.rowActions}><button disabled={savingId === leave.id} onClick={() => decide(leave, "APPROVED")} style={styles.approve}>Approve</button><button disabled={savingId === leave.id} onClick={() => decide(leave, "REJECTED")} style={styles.reject}>Reject</button></div> : <small style={styles.small}>{leave.reviewedBy || "Reviewed"}</small>}</td>}</tr>)}</tbody></table></div>}
    </section>
  </main>;
}

function statusStyle(status) {
  if (status === "APPROVED") return { ...styles.status, background: "#dcfce7", color: "#166534" };
  if (status === "REJECTED") return { ...styles.status, background: "#fee2e2", color: "#991b1b" };
  return { ...styles.status, background: "#fef3c7", color: "#92400e" };
}

const styles = {
  page: { minHeight: "100vh", padding: 32, boxSizing: "border-box", background: "#f3f5f2", color: "#25332f", fontFamily: "Arial,sans-serif" }, header: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18, marginBottom: 22 }, title: { margin: 0, fontSize: 29 }, heading: { margin: 0, fontSize: 19 }, muted: { color: "#718079", fontSize: 14, lineHeight: 1.5, margin: "7px 0 16px" }, back: { color: "#47796f", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }, panel: { background: "#fff", borderRadius: 12, padding: 24, marginBottom: 18, boxShadow: "0 3px 14px rgba(20,40,80,.05)" }, grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginTop: 18 }, field: { display: "grid", gap: 7, color: "#45534e", fontSize: 13, fontWeight: 600 }, input: { width: "100%", boxSizing: "border-box", padding: "11px 12px", border: "1px solid #d6ded8", borderRadius: 7, color: "#25332f", font: "inherit" }, actions: { display: "flex", justifyContent: "flex-end", marginTop: 18 }, primary: { border: 0, padding: "11px 16px", borderRadius: 7, background: "#47796f", color: "white", fontWeight: 700, cursor: "pointer" }, listHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 12 }, filter: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#45534e" }, filterInput: { padding: "8px 10px", border: "1px solid #d6ded8", borderRadius: 7, background: "#fff" }, tableWrap: { overflowX: "auto" }, table: { width: "100%", borderCollapse: "collapse", minWidth: 720 }, th: { textAlign: "left", padding: 12, background: "#f7f8f6", borderBottom: "1px solid #e1e7e2", color: "#65726c", fontSize: 12, whiteSpace: "nowrap" }, td: { padding: 12, borderBottom: "1px solid #edf0f5", color: "#45534e", fontSize: 13, verticalAlign: "top" }, small: { display: "block", marginTop: 5, color: "#718079", fontSize: 11 }, status: { display: "inline-block", padding: "5px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700 }, rowActions: { display: "flex", gap: 6 }, approve: { border: 0, borderRadius: 6, padding: "7px 9px", background: "#16a34a", color: "#fff", cursor: "pointer" }, reject: { border: "1px solid #fecaca", borderRadius: 6, padding: "7px 9px", background: "#fff", color: "#b91c1c", cursor: "pointer" }, empty: { padding: 24, textAlign: "center", color: "#718079" }, success: { marginBottom: 14, padding: 14, borderRadius: 8, background: "#e8f8ef", color: "#166534" }, error: { marginBottom: 14, padding: 14, borderRadius: 8, background: "#fee2e2", color: "#991b1b" },
};

export default Leaves;
