import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createHoliday, deleteHoliday, getAttendancePolicy, getHolidays, updateAttendancePolicy, updateHoliday } from "../../services/api";

const weekdays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const defaultPolicy = { officeStartTime: "09:00", officeEndTime: "18:00", checkInOpensAt: "08:00", checkInClosesAt: "11:00", lateGraceMinutes: 15, halfDayMinimumMinutes: 240, weekOffDays: "SUNDAY" };
const blankHoliday = { holidayDate: "", name: "", description: "" };

function timeValue(value) { return value ? value.slice(0, 5) : ""; }

function AttendanceSchedule() {
  const { token } = useAuth();
  const [policy, setPolicy] = useState(defaultPolicy);
  const [holidays, setHolidays] = useState([]);
  const [holidayForm, setHolidayForm] = useState(blankHoliday);
  const [editingHolidayId, setEditingHolidayId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [savingHoliday, setSavingHoliday] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true); setError("");
      const [loadedPolicy, loadedHolidays] = await Promise.all([getAttendancePolicy(token), getHolidays(token)]);
      setPolicy({ ...loadedPolicy, officeStartTime: timeValue(loadedPolicy.officeStartTime), officeEndTime: timeValue(loadedPolicy.officeEndTime), checkInOpensAt: timeValue(loadedPolicy.checkInOpensAt), checkInClosesAt: timeValue(loadedPolicy.checkInClosesAt) });
      setHolidays(loadedHolidays);
    } catch (err) { setError(err.response?.data?.message || "Unable to load calendar and office rules."); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [token]);

  function changeDay(day) {
    const selected = new Set(policy.weekOffDays.split(",").filter(Boolean));
    selected.has(day) ? selected.delete(day) : selected.add(day);
    setPolicy({ ...policy, weekOffDays: weekdays.filter((value) => selected.has(value)).join(",") });
  }

  async function savePolicy(event) {
    event.preventDefault(); setSavingPolicy(true); setError(""); setMessage("");
    try {
      const saved = await updateAttendancePolicy(token, { ...policy, halfDayMinimumMinutes: Math.round(Number(policy.halfDayMinimumMinutes)) });
      setPolicy({ ...saved, officeStartTime: timeValue(saved.officeStartTime), officeEndTime: timeValue(saved.officeEndTime), checkInOpensAt: timeValue(saved.checkInOpensAt), checkInClosesAt: timeValue(saved.checkInClosesAt) });
      setMessage("Attendance rules saved.");
    } catch (err) { setError(err.response?.data?.message || "Unable to save attendance rules."); }
    finally { setSavingPolicy(false); }
  }

  async function saveHoliday(event) {
    event.preventDefault(); setSavingHoliday(true); setError(""); setMessage("");
    try {
      if (editingHolidayId) await updateHoliday(token, editingHolidayId, holidayForm);
      else await createHoliday(token, holidayForm);
      setHolidayForm(blankHoliday); setEditingHolidayId(null);
      setMessage(editingHolidayId ? "Holiday updated." : "Holiday added to the calendar.");
      setHolidays(await getHolidays(token));
    } catch (err) { setError(err.response?.data?.message || "Unable to save holiday."); }
    finally { setSavingHoliday(false); }
  }

  async function removeHoliday(holiday) {
    if (!window.confirm(`Remove ${holiday.name} from the holiday calendar?`)) return;
    try { await deleteHoliday(token, holiday.id); setHolidays(await getHolidays(token)); setMessage("Holiday removed."); }
    catch (err) { setError(err.response?.data?.message || "Unable to remove holiday."); }
  }

  function editHoliday(holiday) {
    setEditingHolidayId(holiday.id); setHolidayForm({ holidayDate: holiday.holidayDate, name: holiday.name, description: holiday.description || "" });
  }

  if (loading) return <main style={styles.page}><p>Loading attendance settings…</p></main>;

  return <main style={styles.page}>
    <header style={styles.header}><div><h1 style={styles.title}>Calendar & Office Hours</h1><p style={styles.muted}>Set working days, attendance times, and company holidays.</p></div><Link to="/admin" style={styles.back}>← Dashboard</Link></header>
    {message && <div role="status" style={styles.success}>{message}</div>}{error && <div role="alert" style={styles.error}>{error}</div>}

    <section style={styles.panel}>
      <h2 style={styles.heading}>Office and attendance rules</h2>
      <p style={styles.muted}>The check-in window controls when staff can record attendance. Arrivals after office start plus the grace period are marked late. A completed shift below the half-day threshold is marked half-day.</p>
      <form onSubmit={savePolicy}>
        <div style={styles.grid}>
          <Field label="Office starts"><input type="time" required value={policy.officeStartTime} onChange={(e) => setPolicy({ ...policy, officeStartTime: e.target.value })} style={styles.input} /></Field>
          <Field label="Office ends"><input type="time" required value={policy.officeEndTime} onChange={(e) => setPolicy({ ...policy, officeEndTime: e.target.value })} style={styles.input} /></Field>
          <Field label="Check-in opens"><input type="time" required value={policy.checkInOpensAt} onChange={(e) => setPolicy({ ...policy, checkInOpensAt: e.target.value })} style={styles.input} /></Field>
          <Field label="Check-in closes"><input type="time" required value={policy.checkInClosesAt} onChange={(e) => setPolicy({ ...policy, checkInClosesAt: e.target.value })} style={styles.input} /></Field>
          <Field label="Late grace (minutes)"><input type="number" min="0" max="180" required value={policy.lateGraceMinutes} onChange={(e) => setPolicy({ ...policy, lateGraceMinutes: Number(e.target.value) })} style={styles.input} /></Field>
          <Field label="Minimum hours for full day"><input type="number" min="1" max="10" step="0.5" required value={Number(policy.halfDayMinimumMinutes) / 60} onChange={(e) => setPolicy({ ...policy, halfDayMinimumMinutes: Number(e.target.value) * 60 })} style={styles.input} /><small style={styles.hint}>Less time after check-out is recorded as half-day.</small></Field>
        </div>
        <div style={styles.daysBlock}><strong>Weekly off days</strong><div style={styles.days}>{weekdays.map((day) => <label key={day} style={styles.day}><input type="checkbox" checked={policy.weekOffDays.split(",").includes(day)} onChange={() => changeDay(day)} />{day.charAt(0) + day.slice(1).toLowerCase()}</label>)}</div></div>
        <div style={styles.actions}><button type="submit" disabled={savingPolicy} style={styles.primary}>{savingPolicy ? "Saving…" : "Save attendance rules"}</button></div>
      </form>
    </section>

    <section style={styles.panel}>
      <h2 style={styles.heading}>{editingHolidayId ? "Edit holiday" : "Add company holiday"}</h2>
      <form onSubmit={saveHoliday}>
        <div style={styles.grid}>
          <Field label="Date"><input type="date" required value={holidayForm.holidayDate} onChange={(e) => setHolidayForm({ ...holidayForm, holidayDate: e.target.value })} style={styles.input} /></Field>
          <Field label="Holiday name"><input required maxLength="120" value={holidayForm.name} onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })} placeholder="Company holiday" style={styles.input} /></Field>
          <Field label="Note (optional)"><input maxLength="500" value={holidayForm.description} onChange={(e) => setHolidayForm({ ...holidayForm, description: e.target.value })} placeholder="Optional details" style={styles.input} /></Field>
        </div>
        <div style={styles.actions}>{editingHolidayId && <button type="button" onClick={() => { setEditingHolidayId(null); setHolidayForm(blankHoliday); }} style={styles.secondary}>Cancel edit</button>}<button type="submit" disabled={savingHoliday} style={styles.primary}>{savingHoliday ? "Saving…" : editingHolidayId ? "Save holiday" : "Add holiday"}</button></div>
      </form>
      <div style={styles.tableWrap}><table style={styles.table}><thead><tr><th style={styles.th}>Date</th><th style={styles.th}>Holiday</th><th style={styles.th}>Note</th><th style={styles.th}>Actions</th></tr></thead><tbody>{holidays.length ? holidays.map((holiday) => <tr key={holiday.id}><td style={styles.td}>{holiday.holidayDate}</td><td style={styles.td}>{holiday.name}</td><td style={styles.td}>{holiday.description || "-"}</td><td style={styles.td}><button type="button" onClick={() => editHoliday(holiday)} style={styles.inlineButton}>Edit</button><button type="button" onClick={() => removeHoliday(holiday)} style={styles.deleteButton}>Remove</button></td></tr>) : <tr><td style={styles.empty} colSpan="4">No company holidays added.</td></tr>}</tbody></table></div>
    </section>
  </main>;
}

function Field({ label, children }) { return <label style={styles.field}><span>{label}</span>{children}</label>; }

const styles = {
  page: { minHeight: "100vh", padding: 32, boxSizing: "border-box", background: "#f3f5f2", color: "#25332f", fontFamily: "Arial,sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18, marginBottom: 22 }, title: { margin: 0, fontSize: 29 }, muted: { color: "#718079", fontSize: 14, lineHeight: 1.5 }, back: { color: "#47796f", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" },
  panel: { background: "#fff", borderRadius: 12, padding: 24, marginBottom: 18, boxShadow: "0 3px 14px rgba(20,40,80,.05)" }, heading: { margin: 0, fontSize: 19 }, grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginTop: 20 }, field: { display: "grid", alignContent: "start", gap: 7, color: "#45534e", fontSize: 13, fontWeight: 600 }, input: { width: "100%", padding: "11px 12px", boxSizing: "border-box", border: "1px solid #d6ded8", borderRadius: 7, background: "white", color: "#25332f", font: "inherit" }, hint: { color: "#718079", fontWeight: 400 }, daysBlock: { marginTop: 24, color: "#45534e", fontSize: 14 }, days: { display: "flex", flexWrap: "wrap", gap: "12px 20px", marginTop: 12 }, day: { display: "flex", alignItems: "center", gap: 7, fontSize: 13, cursor: "pointer" }, actions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }, primary: { border: 0, padding: "11px 16px", borderRadius: 7, background: "#47796f", color: "white", fontWeight: 700, cursor: "pointer" }, secondary: { border: "1px solid #d6ded8", padding: "10px 14px", borderRadius: 7, background: "white", color: "#47554f", cursor: "pointer" }, tableWrap: { overflowX: "auto", marginTop: 22 }, table: { width: "100%", borderCollapse: "collapse", minWidth: 620 }, th: { textAlign: "left", padding: 12, background: "#f7f8f6", borderBottom: "1px solid #e1e7e2", color: "#65726c", fontSize: 12 }, td: { padding: 12, borderBottom: "1px solid #edf0f5", fontSize: 13, color: "#45534e" }, inlineButton: { border: "1px solid #d6ded8", background: "#fff", borderRadius: 6, padding: "6px 9px", cursor: "pointer", color: "#47554f" }, deleteButton: { border: "1px solid #fecaca", background: "#fff", color: "#b91c1c", borderRadius: 6, padding: "6px 9px", marginLeft: 7, cursor: "pointer" }, empty: { padding: 24, textAlign: "center", color: "#718079" }, success: { marginBottom: 14, padding: 14, borderRadius: 8, background: "#e8f8ef", color: "#166534" }, error: { marginBottom: 14, padding: 14, borderRadius: 8, background: "#fee2e2", color: "#991b1b" },
};

export default AttendanceSchedule;
