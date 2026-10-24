import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createWorkArea, deactivateWorkArea, getWorkAreas, updateWorkArea } from "../../services/api";

const emptyForm = { name: "", areaType: "OFFICE", latitude: "", longitude: "", radiusMeters: 300 };

function WorkAreas() {
  const { token } = useAuth();
  const [areas, setAreas] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");
      setAreas(await getWorkAreas(token));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load work areas.");
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [token]);

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setError("Location is not supported by this browser.");
      return;
    }
    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      setForm((current) => ({ ...current, latitude: coords.latitude.toFixed(6), longitude: coords.longitude.toFixed(6) }));
      setLocating(false);
    }, (geoError) => {
      setError(geoError.code === 1 ? "Allow location access to set this work area." : "Couldn't get this device's location.");
      setLocating(false);
    }, { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        ...form,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        radiusMeters: Number(form.radiusMeters),
        active: true,
      };
      if (editingId) await updateWorkArea(token, editingId, payload);
      else await createWorkArea(token, payload);
      setForm(emptyForm);
      setEditingId(null);
      setMessage(editingId ? "Work area updated." : "Work area added. Office areas allow desk and field attendance; field areas allow field officers.");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save the work area.");
    } finally { setSaving(false); }
  }

  function editArea(area) {
    setEditingId(area.id);
    setForm({ name: area.name, areaType: area.areaType, latitude: String(area.latitude), longitude: String(area.longitude), radiusMeters: area.radiusMeters });
    setError("");
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() { setEditingId(null); setForm(emptyForm); }

  async function disableArea(area) {
    if (!window.confirm(`Disable “${area.name}”? Employees will no longer be able to check in or out there.`)) return;
    try {
      await deactivateWorkArea(token, area.id);
      await load();
      setMessage(`${area.name} has been disabled.`);
    } catch (err) { setError(err.response?.data?.message || "Unable to disable work area."); }
  }

  async function enableArea(area) {
    try {
      await updateWorkArea(token, area.id, { ...area, active: true });
      await load();
      setMessage(`${area.name} has been enabled.`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to enable work area.");
    }
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div><h1 style={styles.title}>Attendance Work Areas</h1><p style={styles.subtitle}>Manage the GPS zones where employees may start and end their workday.</p></div>
        <Link to="/admin" style={styles.back}>← Dashboard</Link>
      </header>

      <div style={styles.notice}><strong>Attendance is separate from visits.</strong> A check-in here records the employee’s workday only. It does not complete any monthly assigned visit.</div>
      {message && <div role="status" style={styles.success}>{message}</div>}
      {error && <div role="alert" style={styles.error}>{error}</div>}

      <section style={styles.panel}>
        <h2 style={styles.sectionTitle}>{editingId ? "Edit approved area" : "Add an approved area"}</h2>
        <p style={styles.help}>Desk employees can check in only at Office areas. Field officers can check in at Office or Field areas. These areas are shared by employees of the matching type.</p>
        <form onSubmit={handleSubmit}>
          <div style={styles.grid}>
            <label style={styles.field}>Area name<input required maxLength="100" placeholder="Main office / North territory" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={styles.input} /></label>
            <label style={styles.field}>Area type<select value={form.areaType} onChange={(e) => setForm({ ...form, areaType: e.target.value })} style={styles.input}><option value="OFFICE">Office (desk + field officers)</option><option value="FIELD">Field (field officers only)</option></select></label>
            <label style={styles.field}>Latitude<input required type="number" step="any" min="-90" max="90" placeholder="e.g. 28.613900" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} style={styles.input} /></label>
            <label style={styles.field}>Longitude<input required type="number" step="any" min="-180" max="180" placeholder="e.g. 77.209000" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} style={styles.input} /></label>
            <label style={styles.field}>Allowed radius (meters)<input required type="number" min="25" max="20000" value={form.radiusMeters} onChange={(e) => setForm({ ...form, radiusMeters: e.target.value })} style={styles.input} /></label>
          </div>
          <div style={styles.formActions}>
            <button type="button" disabled={locating} onClick={useCurrentLocation} style={styles.secondary}>{locating ? "Getting location…" : "Use this device’s location"}</button>
            {editingId && <button type="button" onClick={cancelEdit} style={styles.secondary}>Cancel edit</button>}
            <button type="submit" disabled={saving} style={styles.primary}>{saving ? "Saving…" : editingId ? "Save changes" : "Add work area"}</button>
          </div>
        </form>
      </section>

      <section style={styles.panel}>
        <div style={styles.listHeading}><div><h2 style={styles.sectionTitle}>Configured areas</h2><p style={styles.help}>GPS is requested only when someone checks in or out. The reported point must be inside the zone, with location accuracy within 250 m and no worse than that zone’s radius.</p></div></div>
        {loading ? <p style={styles.empty}>Loading work areas…</p> : areas.length === 0 ? <p style={styles.empty}>No approved work areas yet. Add an office area to enable location-verified attendance.</p> : (
          <div style={styles.tableWrap}><table style={styles.table}><thead><tr><th style={styles.th}>Area</th><th style={styles.th}>Type</th><th style={styles.th}>Center</th><th style={styles.th}>Radius</th><th style={styles.th}>Status</th><th style={styles.th}>Action</th></tr></thead><tbody>
            {areas.map((area) => <tr key={area.id}><td style={styles.td}><strong>{area.name}</strong></td><td style={styles.td}>{area.areaType === "OFFICE" ? "Office" : "Field"}</td><td style={styles.td}>{Number(area.latitude).toFixed(5)}, {Number(area.longitude).toFixed(5)}</td><td style={styles.td}>{area.radiusMeters} m</td><td style={styles.td}><span style={area.active ? styles.active : styles.inactive}>{area.active ? "Active" : "Disabled"}</span></td><td style={styles.td}>{area.active ? <><button onClick={() => editArea(area)} style={styles.edit}>Edit</button><button onClick={() => disableArea(area)} style={styles.disable}>Disable</button></> : <button onClick={() => enableArea(area)} style={styles.enable}>Enable</button>}</td></tr>)}
          </tbody></table></div>
        )}
      </section>
    </main>
  );
}

const styles = {
  page: { minHeight: "100vh", padding: "32px", boxSizing: "border-box", background: "#f4f6fa", color: "#172033", fontFamily: "Arial,sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, marginBottom: 22 },
  title: { margin: 0, fontSize: 29 }, subtitle: { margin: "8px 0 0", color: "#64748b" }, back: { color: "#245be8", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" },
  notice: { padding: "15px 18px", marginBottom: 16, border: "1px solid #cbd8ff", borderRadius: 10, background: "#eef3ff", color: "#334776", lineHeight: 1.5 },
  panel: { background: "#fff", borderRadius: 12, padding: 24, marginBottom: 18, boxShadow: "0 3px 14px rgba(20,40,80,.05)" },
  sectionTitle: { margin: 0, fontSize: 19 }, help: { color: "#64748b", fontSize: 13, lineHeight: 1.5, margin: "7px 0 18px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 16 }, field: { display: "grid", gap: 7, color: "#374151", fontSize: 13, fontWeight: 600 },
  input: { width: "100%", boxSizing: "border-box", padding: "11px 12px", border: "1px solid #cbd5e1", borderRadius: 7, fontSize: 14, color: "#172033", background: "#fff" },
  formActions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18, flexWrap: "wrap" },
  primary: { border: 0, padding: "11px 16px", borderRadius: 7, background: "#245be8", color: "white", fontWeight: 700, cursor: "pointer" }, secondary: { border: "1px solid #cbd5e1", padding: "10px 14px", borderRadius: 7, background: "white", color: "#334155", fontWeight: 600, cursor: "pointer" },
  tableWrap: { overflowX: "auto" }, table: { width: "100%", borderCollapse: "collapse", minWidth: 700 }, th: { textAlign: "left", padding: 13, background: "#f8fafc", color: "#526178", fontSize: 12, borderBottom: "1px solid #e5eaf1" }, td: { padding: 13, borderBottom: "1px solid #edf0f5", fontSize: 13, color: "#374151" },
  active: { color: "#147a4a", background: "#e6f7ee", borderRadius: 20, padding: "5px 9px", fontSize: 11, fontWeight: 700 }, inactive: { color: "#8a4d13", background: "#fff1d6", borderRadius: 20, padding: "5px 9px", fontSize: 11, fontWeight: 700 }, disable: { border: "1px solid #fecaca", borderRadius: 6, padding: "7px 10px", background: "#fff", color: "#b91c1c", cursor: "pointer", marginLeft: 6 }, edit: { border: "1px solid #cbd5e1", borderRadius: 6, padding: "7px 10px", background: "#fff", color: "#334155", cursor: "pointer" }, enable: { border: "1px solid #bbf7d0", borderRadius: 6, padding: "7px 10px", background: "#f0fdf4", color: "#15803d", cursor: "pointer", fontWeight: 600 },
  listHeading: { marginBottom: 10 }, empty: { color: "#64748b", padding: "18px 0" }, success: { marginBottom: 14, padding: 14, borderRadius: 8, background: "#e8f8ef", color: "#166534" }, error: { marginBottom: 14, padding: 14, borderRadius: 8, background: "#fee2e2", color: "#991b1b" },
};

export default WorkAreas;
