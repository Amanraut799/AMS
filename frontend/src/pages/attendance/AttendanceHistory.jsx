import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMyAttendanceHistory } from "../../services/attendanceService";

function AttendanceHistory() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    loadAttendanceHistory();
  }, []);

  async function loadAttendanceHistory() {
    try {
      setLoading(true);
      setError("");

      const data = await getMyAttendanceHistory(token);

      setAttendance(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load attendance history.");
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date) {
    if (!date) {
      return "-";
    }

    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  function formatTime(dateTime) {
    if (!dateTime) {
      return "-";
    }

    return new Date(dateTime).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const filteredAttendance = attendance.filter((record) => {
    const matchesMonth = !monthFilter || record.attendanceDate?.startsWith(monthFilter);
    const matchesStatus = statusFilter === "ALL" || record.status === statusFilter;
    return matchesMonth && matchesStatus;
  });

  const availableStatuses = [...new Set(attendance.map((record) => record.status).filter(Boolean))].sort();

  function clearFilters() {
    setMonthFilter("");
    setStatusFilter("ALL");
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.logo}>AttendPro</h1>
          <p style={styles.subtitle}>
            Attendance History
          </p>
        </div>

        <button
          onClick={() => navigate("/employee")}
          style={styles.backButton}
        >
          ← Dashboard
        </button>
      </header>

      <main style={styles.content}>
        <div style={styles.titleSection}>
          <h2>My Attendance History</h2>
          <p>
            View your previous attendance records.
          </p>
        </div>

        <div style={styles.card}>
          {!loading && !error && attendance.length > 0 && (
            <div style={styles.filters}>
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel} htmlFor="attendance-month">Month</label>
                <input
                  id="attendance-month"
                  type="month"
                  value={monthFilter}
                  onChange={(event) => setMonthFilter(event.target.value)}
                  style={styles.filterInput}
                />
              </div>
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel} htmlFor="attendance-status">Status</label>
                <select
                  id="attendance-status"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  style={styles.filterInput}
                >
                  <option value="ALL">All statuses</option>
                  {availableStatuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
                </select>
              </div>
              <button type="button" onClick={clearFilters} style={styles.clearButton}>Clear filters</button>
              <span style={styles.resultCount} aria-live="polite">Showing {filteredAttendance.length} of {attendance.length} records</span>
            </div>
          )}

          {loading && (
            <div style={styles.centerMessage}>
              Loading attendance history...
            </div>
          )}

          {!loading && error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          {!loading && !error && attendance.length === 0 && (
            <div style={styles.centerMessage}>
              No attendance records found.
            </div>
          )}

          {!loading && !error && attendance.length > 0 && (
            filteredAttendance.length === 0 ? (
              <div style={styles.centerMessage}>No records match these filters. Try a different month or status.</div>
            ) : <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Arrival</th>
                    <th style={styles.th}>Check In</th>
                    <th style={styles.th}>Check Out</th>
                    <th style={styles.th}>Check-in area</th>
                    <th style={styles.th}>Check-out area</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAttendance.map((record) => (
                    <tr key={record.id}>
                      <td style={styles.td}>
                        {formatDate(
                          record.attendanceDate
                        )}
                      </td>

                      <td style={styles.td}>
                        <span style={{ ...styles.status, ...(record.status === "HALF_DAY" ? styles.halfDayStatus : {}) }}>
                          {record.status}
                        </span>
                      </td>

                      <td style={styles.td}>{record.checkInTime ? record.late ? `Late · ${record.lateMinutes || 0} min` : "On time" : "-"}</td>

                      <td style={styles.td}>
                        {formatTime(
                          record.checkInTime
                        )}
                      </td>

                      <td style={styles.td}>
                        {formatTime(
                          record.checkOutTime
                        )}
                      </td>

                      <td style={styles.td}>{record.checkInWorkArea || "-"}</td>
                      <td style={styles.td}>{record.checkOutWorkArea || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f4f6f8",
  },

  header: {
    backgroundColor: "#ffffff",
    padding: "20px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #e5e7eb",
  },

  logo: {
    margin: 0,
    fontSize: "28px",
    color: "#2563eb",
  },

  subtitle: {
    margin: "4px 0 0",
    color: "#666",
  },

  backButton: {
    padding: "10px 18px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "14px",
  },

  content: {
    padding: "35px 40px",
  },

  titleSection: {
    marginBottom: "25px",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "25px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },

  tableContainer: {
    overflowX: "auto",
  },

  filters: { display: "flex", alignItems: "end", gap: "14px", flexWrap: "wrap", marginBottom: "22px", paddingBottom: "18px", borderBottom: "1px solid #e5e7eb" },
  filterGroup: { display: "grid", gap: "7px" },
  filterLabel: { fontSize: "13px", fontWeight: 600, color: "#374151" },
  filterInput: { minWidth: "170px", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "7px", color: "#1f2937", background: "#fff", font: "inherit" },
  clearButton: { padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "7px", color: "#374151", background: "#fff", cursor: "pointer" },
  resultCount: { marginLeft: "auto", paddingBottom: "10px", color: "#6b7280", fontSize: "13px" },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: "15px",
    borderBottom: "2px solid #e5e7eb",
    color: "#374151",
    fontSize: "14px",
  },

  td: {
    padding: "15px",
    borderBottom: "1px solid #e5e7eb",
    color: "#4b5563",
  },

  status: {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: "20px",
    backgroundColor: "#dcfce7",
    color: "#15803d",
    fontSize: "12px",
    fontWeight: "600",
  },
  halfDayStatus: { backgroundColor: "#f3e8ff", color: "#7e22ce" },

  centerMessage: {
    textAlign: "center",
    padding: "50px",
    color: "#666",
  },

  error: {
    textAlign: "center",
    padding: "20px",
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    borderRadius: "6px",
  },
};

export default AttendanceHistory;
