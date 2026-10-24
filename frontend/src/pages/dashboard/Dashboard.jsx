import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAdminDashboard, getTodayAttendance} from "../../services/api";

function Dashboard() {
  const { user, token } = useAuth();

  const [stats, setStats] = useState(null);
  const [attendance, setAttendance] = useState([]);

  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(true);

  const [error, setError] = useState("");
  const [attendanceError, setAttendanceError] = useState("");

  useEffect(() => {
    loadDashboard();
    loadAttendance();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminDashboard(token);

      setStats(data);
    } catch (error) {
      console.error(error);
      setError("Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

async function loadAttendance() {
  try {
    setAttendanceLoading(true);
    setAttendanceError("");

    const data = await getTodayAttendance(token);

    setAttendance(data);
  } catch (error) {
    console.error(error);
    setAttendanceError(
      "Unable to load attendance records."
    );
  } finally {
    setAttendanceLoading(false);
  }
}

  async function refreshDashboard() {
    await Promise.all([
      loadDashboard(),
      loadAttendance(),
    ]);
  }

  function formatDate(date) {
    if (!date) return "-";

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
    if (!dateTime) return "-";

    return new Date(dateTime).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  return (
    <div style={styles.page}>

      {/* Main Content */}
      <main style={styles.main}>

        {/* Header */}
        <header style={styles.header}>

          <div>

            <h1 style={styles.title}>
              Admin Dashboard
            </h1>

            <p style={styles.subtitle}>
              Welcome back, {user?.email}
            </p>

          </div>

          <div style={styles.headerRight}>

            <button
              onClick={refreshDashboard}
              style={styles.refreshButton}
            >
              Refresh
            </button>

            <div style={styles.userBadge}>
              ADMIN
            </div>

          </div>

        </header>


        {/* Error */}
        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}


{/* Today's Statistics - Row 1 */}
<section style={styles.cards}>

  <div style={styles.card}>
    <p style={styles.cardLabel}>
      Total Employees
    </p>

    <h2 style={styles.cardNumber}>
      {loading
        ? "..."
        : stats?.totalEmployees ?? 0}
    </h2>
  </div>


  <div style={styles.card}>
    <p style={styles.cardLabel}>
      Present Today
    </p>

    <h2 style={styles.cardNumber}>
      {loading
        ? "..."
        : stats?.presentToday ?? 0}
    </h2>
  </div>


  <div style={styles.card}>
    <p style={styles.cardLabel}>
      Absent Today
    </p>

    <h2 style={styles.cardNumber}>
      {loading
        ? "..."
        : stats?.absentToday ?? 0}
    </h2>
  </div>


  <div style={styles.card}>
    <p style={styles.cardLabel}>
      Today's Attendance Rate
    </p>

    <h2 style={styles.cardNumber}>
      {loading
        ? "..."
        : `${stats?.attendanceRate ?? 0}%`}
    </h2>
  </div>

</section>


{/* Today's Attendance Details - Row 2 */}
<section style={styles.cards}>

  <div style={styles.card}>
    <p style={styles.cardLabel}>
      Checked In Today
    </p>

    <h2 style={styles.cardNumber}>
      {loading
        ? "..."
        : stats?.checkedIn ?? 0}
    </h2>
  </div>


  <div style={styles.card}>
    <p style={styles.cardLabel}>
      Checked Out Today
    </p>

    <h2 style={styles.cardNumber}>
      {loading
        ? "..."
        : stats?.checkedOut ?? 0}
    </h2>
  </div>

  <div style={styles.card}>
    <p style={styles.cardLabel}>Half Day Today</p>
    <h2 style={styles.cardNumber}>{loading ? "..." : stats?.halfDayToday ?? 0}</h2>
  </div>


  <div style={styles.card}>
    <p style={styles.cardLabel}>
      Today's Attendance Records
    </p>

    <h2 style={styles.cardNumber}>
      {loading
        ? "..."
        : stats?.totalAttendanceRecords ?? 0}
    </h2>
  </div>


  <div style={styles.card}>
    <p style={styles.cardLabel}>
      Pending Leaves Today
    </p>

    <h2 style={styles.cardNumber}>
      0
    </h2>

    <small style={styles.comingSoon}>
      Leaves module coming soon
    </small>
  </div>

</section>


        {/* Today's Attendance */}
        <section style={styles.attendanceSection}>

          <div style={styles.sectionHeader}>

            <div>
              <h2 style={styles.sectionTitle}>
                Today's Attendance
              </h2>

              <p style={styles.sectionDescription}>
                Attendance records for all employees
              </p>
            </div>

            <button
              onClick={loadAttendance}
              style={styles.smallRefreshButton}
            >
              Refresh
            </button>

          </div>


          {/* Attendance Error */}
          {attendanceError && (
            <div style={styles.error}>
              {attendanceError}
            </div>
          )}


          {/* Loading */}
          {attendanceLoading && (
            <div style={styles.message}>
              Loading attendance...
            </div>
          )}


          {/* Empty */}
          {!attendanceLoading &&
            !attendanceError &&
            attendance.length === 0 && (
              <div style={styles.message}>
                No attendance records found.
              </div>
            )}


          {/* Table */}
          {!attendanceLoading &&
            !attendanceError &&
            attendance.length > 0 && (

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

                      <th style={styles.th}>
                        Check Out
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {attendance.map((record) => (

                      <tr key={record.id}>

                        <td style={styles.td}>
                          {record.employee?.employeeCode || "-"}
                        </td>


                        <td style={styles.td}>

                          <strong>
                            {record.employee?.firstName || ""}
                            {" "}
                            {record.employee?.lastName || ""}
                          </strong>

                        </td>


                        <td style={styles.td}>
                          {record.employee?.department || "-"}
                        </td>


                        <td style={styles.td}>
                          {formatDate(
                            record.attendanceDate
                          )}
                        </td>


                        <td style={styles.td}>

                          <span
                            style={
                              record.status === "PRESENT"
                                ? styles.presentStatus
                                : styles.otherStatus
                            }
                          >
                            {record.status}
                          </span>

                        </td>


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

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

        </section>


        {/* Welcome */}
        <section style={styles.welcome}>

          <h2>
            Welcome to AttendPro 👋
          </h2>

          <p>
            Manage employees, attendance, leaves and
            reports from this dashboard.
          </p>

        </section>

      </main>

    </div>
  );
}


const styles = {

  page: {
    minHeight: "100vh",
    display: "flex",
    backgroundColor: "#f5f7fb",
    fontFamily: "Arial, sans-serif",
  },


  sidebar: {
    width: "240px",
    minHeight: "100vh",
    backgroundColor: "#111827",
    color: "#ffffff",
    padding: "25px 15px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
  },


  logo: {
    fontSize: "26px",
    fontWeight: "bold",
    padding: "10px 15px 30px",
  },


  link: {
    display: "block",
    color: "#d1d5db",
    textDecoration: "none",
    padding: "13px 15px",
    borderRadius: "6px",
    marginBottom: "5px",
  },


  activeLink: {
    display: "block",
    color: "#ffffff",
    backgroundColor: "#2563eb",
    textDecoration: "none",
    padding: "13px 15px",
    borderRadius: "6px",
    marginBottom: "5px",
  },


  logout: {
    marginTop: "auto",
    padding: "12px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#dc2626",
    color: "#ffffff",
    fontSize: "15px",
    cursor: "pointer",
  },


  main: {
    flex: 1,
    padding: "30px",
    boxSizing: "border-box",
    overflowX: "hidden",
  },


  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },


  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },


  title: {
    margin: 0,
    fontSize: "30px",
  },


  subtitle: {
    marginTop: "8px",
    color: "#6b7280",
  },


  userBadge: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    padding: "10px 18px",
    borderRadius: "20px",
    fontWeight: "bold",
  },


  refreshButton: {
    padding: "10px 18px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#16a34a",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "14px",
  },


  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
    marginBottom: "20px",
  },


  card: {
    backgroundColor: "#ffffff",
    padding: "25px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.06)",
  },


  cardLabel: {
    margin: 0,
    color: "#6b7280",
    fontSize: "14px",
  },


  cardNumber: {
    marginTop: "10px",
    marginBottom: 0,
    fontSize: "32px",
  },


  attendanceSection: {
    marginTop: "30px",
    backgroundColor: "#ffffff",
    padding: "25px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.06)",
  },


  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },


  sectionTitle: {
    margin: 0,
    fontSize: "22px",
  },


  sectionDescription: {
    marginTop: "6px",
    marginBottom: 0,
    color: "#6b7280",
    fontSize: "14px",
  },


  smallRefreshButton: {
    padding: "9px 16px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    cursor: "pointer",
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
    padding: "14px",
    borderBottom: "2px solid #e5e7eb",
    color: "#374151",
    fontSize: "13px",
    whiteSpace: "nowrap",
  },


  td: {
    padding: "14px",
    borderBottom: "1px solid #e5e7eb",
    color: "#4b5563",
    whiteSpace: "nowrap",
  },


  presentStatus: {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: "20px",
    backgroundColor: "#dcfce7",
    color: "#15803d",
    fontSize: "12px",
    fontWeight: "600",
  },


  otherStatus: {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: "20px",
    backgroundColor: "#fef3c7",
    color: "#92400e",
    fontSize: "12px",
    fontWeight: "600",
  },


  message: {
    textAlign: "center",
    padding: "40px",
    color: "#6b7280",
  },


  error: {
    marginBottom: "20px",
    padding: "15px",
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    borderRadius: "6px",
  },


  comingSoon: {
    display: "block",
    marginTop: "5px",
    color: "#777",
  },


  welcome: {
    marginTop: "30px",
    backgroundColor: "#ffffff",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.06)",
  },

};

export default Dashboard;
