import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAllAttendance } from "../../services/attendanceService";

function AdminAttendance() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [lateFilter, setLateFilter] = useState("ALL");

  useEffect(() => {
    loadAttendance();
  }, []);

  async function loadAttendance() {
    try {
      setLoading(true);
      setError("");

      const data = await getAllAttendance(token);

      setAttendance(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load attendance records.");
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

  const filteredAttendance = attendance
    .filter((record) => {
      const employee = record.employee || {};
      const employeeName = `${employee.firstName || ""} ${employee.lastName || ""}`;
      const query = search.trim().toLowerCase();
      const matchesSearch = !query || [
        employeeName,
        employee.employeeCode,
        employee.department,
      ].some((value) => value?.toLowerCase().includes(query));

      return matchesSearch
        && (statusFilter === "ALL" || record.status === statusFilter)
        && (lateFilter === "ALL" || (lateFilter === "LATE" ? record.late : !record.late));
    })
    .sort((first, second) =>
      (second.attendanceDate || "").localeCompare(first.attendanceDate || "")
    );

  const presentCount = attendance.filter((record) => record.status === "PRESENT").length;
  const availableStatuses = [...new Set(attendance.map((record) => record.status).filter(Boolean))].sort();

  return (
    <div className="app-page-shell" style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.logo}>AttendPro</h1>

          <p style={styles.subtitle}>
            Admin Attendance Management
          </p>
        </div>

        <button
          onClick={() => navigate("/admin")}
          style={styles.backButton}
        >
          ← Dashboard
        </button>
      </header>

      <main style={styles.content}>
        <div style={styles.titleRow}>
          <div>
            <h2 style={styles.title}>
              Attendance
            </h2>

            <p style={styles.description}>
              View attendance records for all employees.
            </p>
          </div>

          <button
            onClick={loadAttendance}
            style={styles.refreshButton}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>
              Total Records
            </span>

            <strong style={styles.statValue}>
              {attendance.length}
            </strong>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statLabel}>
              Present
            </span>

            <strong style={styles.presentValue}>
              {presentCount}
            </strong>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statLabel}>Other statuses</span>
            <strong style={styles.otherValue}>{attendance.length - presentCount}</strong>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.toolbar}>
            <label style={styles.searchLabel}>
              <span>Search records</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name, employee code, or department"
                style={styles.searchInput}
              />
            </label>
            <label style={styles.filterLabel}>
              <span>Status</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                style={styles.filterSelect}
              >
                <option value="ALL">All statuses</option>
                {availableStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0) + status.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </label>
            <label style={styles.filterLabel}>
              <span>Arrival</span>
              <select value={lateFilter} onChange={(event) => setLateFilter(event.target.value)} style={styles.filterSelect}>
                <option value="ALL">All arrivals</option>
                <option value="LATE">Late only</option>
                <option value="ON_TIME">On time</option>
              </select>
            </label>
            <span style={styles.resultCount}>
              {filteredAttendance.length} of {attendance.length} records
            </span>
          </div>

          {loading && (
            <div style={styles.message}>
              Loading attendance...
            </div>
          )}

          {!loading && error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            attendance.length === 0 && (
              <div style={styles.message}>
                No attendance records found.
              </div>
            )}

          {!loading &&
            !error &&
            attendance.length > 0 && (
              filteredAttendance.length === 0 ? (
                <div style={styles.message}>No records match these filters. Try changing your search or status.</div>
              ) : (
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>
                        Employee Code
                      </th>

                      <th style={styles.th}>
                        Employee
                      </th>

                      <th style={styles.th}>
                        Department
                      </th>

                      <th style={styles.th}>
                        Date
                      </th>

                      <th style={styles.th}>
                        Status
                      </th>

                      <th style={styles.th}>
                        Check In
                      </th>

                      <th style={styles.th}>Arrival</th>

                      <th style={styles.th}>
                        Check Out
                      </th>
                      <th style={styles.th}>Worked</th>
                      <th style={styles.th}>Check-in area / GPS</th>
                      <th style={styles.th}>Check-out area / GPS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAttendance.map((record) => (
                      <tr key={record.id}>
                        <td style={styles.td}>
                          {record.employee?.employeeCode || "-"}
                        </td>

                        <td style={styles.td}>
                          <strong>
                            {record.employee?.firstName}{" "}
                            {record.employee?.lastName}
                          </strong>
                        </td>

                        <td style={styles.td}>
                          {record.employee?.department || "-"}
                        </td>

                        <td style={styles.td}>
                          {formatDate(record.attendanceDate)}
                        </td>

                        <td style={styles.td}>
                          <span style={{
                            ...styles.status,
                            ...(record.status === "PRESENT" ? styles.presentStatus : styles.otherStatus),
                          }}>
                            {record.status || "UNKNOWN"}
                          </span>
                        </td>

                        <td style={styles.td}>
                          {formatTime(record.checkInTime)}
                        </td>

                        <td style={styles.td}>
                          {record.checkInTime ? record.late ? <span style={styles.lateLabel}>Late · {record.lateMinutes || 0}m</span> : <span style={styles.onTimeLabel}>On time</span> : "-"}
                        </td>

                        <td style={styles.td}>
                          {formatTime(record.checkOutTime)}
                        </td>

                        <td style={styles.td}>
                          {record.workedMinutes == null ? "-" : `${Math.floor(record.workedMinutes / 60)}h ${record.workedMinutes % 60}m`}
                        </td>

                        <td style={styles.td}>
                          <LocationDetail area={record.checkInWorkArea} latitude={record.checkInLatitude} longitude={record.checkInLongitude} accuracy={record.checkInAccuracyMeters} />
                        </td>

                        <td style={styles.td}>
                          <LocationDetail area={record.checkOutWorkArea} latitude={record.checkOutLatitude} longitude={record.checkOutLongitude} accuracy={record.checkOutAccuracyMeters} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              )
            )}
        </div>
      </main>
    </div>
  );
}

function LocationDetail({ area, latitude, longitude, accuracy }) {
  if (latitude == null || longitude == null) return <span style={{ color: "#9ca3af" }}>No GPS data</span>;
  return <span title={`${latitude}, ${longitude}`}>
    {area || "Verified area"}<br />
    <small style={{ color: "#718079" }}>{Number(latitude).toFixed(4)}, {Number(longitude).toFixed(4)}{accuracy != null ? ` · ±${Math.round(accuracy)} m` : ""}</small>
  </span>;
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f3f5f2",
  },

  header: {
    backgroundColor: "#ffffff",
    padding: "20px 40px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #e1e7e2",
  },

  logo: {
    margin: 0,
    fontSize: "28px",
    color: "#47796f",
  },

  subtitle: {
    margin: "4px 0 0",
    color: "#66736d",
  },

  backButton: {
    padding: "10px 18px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#47796f",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "14px",
  },

  content: {
    padding: "35px 40px",
  },

  titleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  },

  title: {
    margin: 0,
  },

  description: {
    color: "#66736d",
  },

  refreshButton: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#47796f",
    color: "#ffffff",
    cursor: "pointer",
  },

  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "20px",
    marginBottom: "25px",
  },

  statCard: {
    backgroundColor: "#ffffff",
    padding: "20px 25px",
    borderRadius: "10px",
    minWidth: "180px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },

  statLabel: {
    display: "block",
    color: "#66736d",
    fontSize: "14px",
    marginBottom: "8px",
  },

  statValue: {
    fontSize: "28px",
  },

  presentValue: {
    fontSize: "28px",
    color: "#16a34a",
  },

  otherValue: {
    fontSize: "28px",
    color: "#b45309",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "25px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },

  toolbar: {
    display: "flex",
    alignItems: "end",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },

  searchLabel: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    flex: "1 1 280px",
    color: "#45534e",
    fontSize: "13px",
    fontWeight: 600,
  },

  filterLabel: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    minWidth: "160px",
    color: "#45534e",
    fontSize: "13px",
    fontWeight: 600,
  },

  searchInput: {
    width: "100%",
    minHeight: "42px",
    padding: "10px 12px",
    border: "1px solid #d6ded8",
    borderRadius: "7px",
    fontSize: "14px",
  },

  filterSelect: {
    minHeight: "42px",
    padding: "9px 12px",
    border: "1px solid #d6ded8",
    borderRadius: "7px",
    backgroundColor: "#ffffff",
    fontSize: "14px",
  },

  resultCount: {
    paddingBottom: "12px",
    color: "#718079",
    fontSize: "13px",
  },

  tableContainer: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: "15px",
    borderBottom: "2px solid #e1e7e2",
    color: "#45534e",
    fontSize: "14px",
    whiteSpace: "nowrap",
  },

  td: {
    padding: "15px",
    borderBottom: "1px solid #e1e7e2",
    color: "#5d6a64",
    whiteSpace: "nowrap",
  },

  status: {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },

  presentStatus: {
    backgroundColor: "#dcfce7",
    color: "#15803d",
  },

  otherStatus: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },

  lateLabel: { color: "#b45309", background: "#fff7ed", borderRadius: 14, padding: "5px 8px", fontSize: 12, fontWeight: 700 },
  onTimeLabel: { color: "#15803d", background: "#f0fdf4", borderRadius: 14, padding: "5px 8px", fontSize: 12, fontWeight: 600 },

  message: {
    textAlign: "center",
    padding: "50px",
    color: "#66736d",
  },

  error: {
    padding: "20px",
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    borderRadius: "6px",
    textAlign: "center",
  },
};

export default AdminAttendance;
