import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAttendancePolicy } from "../../services/api";
import {
  markAttendance,
  getMyTodayAttendance,
  checkOut,
  getCurrentLocation,
} from "../../services/attendanceService";

function EmployeeDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [message, setMessage] = useState("");
  const [policy, setPolicy] = useState(null);

  useEffect(() => {
    loadTodayAttendance();
    getAttendancePolicy(token).then(setPolicy).catch((error) => console.error(error));
  }, []);

  async function loadTodayAttendance() {
    try {
      setLoading(true);
      setMessage("");

      const data = await getMyTodayAttendance(token);

      setAttendance(data);
    } catch (error) {
      console.error(error);
      setMessage("Unable to check today's attendance.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAttendance() {
    try {
      setMarking(true);
      setMessage("");

      const location = await getCurrentLocation();
      const data = await markAttendance(token, location);

      setAttendance(data);
      setMessage("Attendance marked successfully!");
    } catch (error) {
      console.error(error);

      if (error.response?.status === 409) {
        setMessage(
          error.response?.data?.message ||
            "Attendance already marked for today."
        );

        await loadTodayAttendance();
      } else if (error.code === 1) {
        setMessage("Location permission is required to mark attendance.");
      } else {
        setMessage(error.response?.data?.message || error.message || "Unable to mark attendance.");
      }
    } finally {
      setMarking(false);
    }
  }

  async function handleCheckOut() {
    try {
      setCheckingOut(true);
      setMessage("");

      const location = await getCurrentLocation();
      const data = await checkOut(token, location);

      setAttendance(data);
      setMessage("Checked out successfully!");
    } catch (error) {
      console.error(error);

      setMessage(error.code === 1
        ? "Location permission is required to check out."
        : error.response?.data?.message || error.message || "Unable to check out.");
    } finally {
      setCheckingOut(false);
    }
  }

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  function formatTime(dateTime) {
    if (!dateTime) {
      return "-";
    }

    return new Date(dateTime).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatOfficeTime(time) {
    if (!time) return "-";
    return new Date(`1970-01-01T${time}`).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.logo}>AttendPro</h1>

          <p style={styles.subtitle}>
            Employee Dashboard
          </p>
        </div>

      </header>

      <div style={styles.welcome}>
        <h2>Welcome, {user?.email}</h2>
        <p>{today}</p>
        {policy && <p style={styles.policyText}>Office hours {formatOfficeTime(policy.officeStartTime)}–{formatOfficeTime(policy.officeEndTime)} · Check-in {formatOfficeTime(policy.checkInOpensAt)}–{formatOfficeTime(policy.checkInClosesAt)} · Late after {policy.lateGraceMinutes} min grace · Full day from {policy.halfDayMinimumMinutes / 60} hours</p>}
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>
          Today's Attendance
        </h2>

        {loading ? (
          <div style={styles.statusBox}>
            <p>Checking attendance...</p>
          </div>
        ) : !attendance ? (
          <div style={styles.statusBox}>
            <div style={styles.clockIcon}>🕐</div>

            <h3>Attendance Not Marked</h3>

            <p style={styles.statusText}>
              Attendance is separate from your assigned visits. Check in from an approved work area.
            </p>

            <button
              onClick={handleMarkAttendance}
              disabled={marking}
              style={styles.attendanceButton}
            >
              {marking
                ? "Checking location..."
                : "Check In"}
            </button>
          </div>
        ) : (
          <div style={styles.statusBox}>
            <div style={styles.checkIcon}>✓</div>

            <h3 style={styles.present}>{attendance.status === "HALF_DAY" ? "HALF DAY" : attendance.status || "PRESENT"}</h3>
            {attendance.late && <p style={styles.lateNote}>Late arrival · {attendance.lateMinutes || 0} minutes</p>}
            {attendance.workedMinutes != null && <p style={styles.workedNote}>Worked {Math.floor(attendance.workedMinutes / 60)}h {attendance.workedMinutes % 60}m</p>}

            <div style={styles.timeContainer}>
              <div style={styles.timeBox}>
                <span style={styles.timeLabel}>
                  Check In
                </span>

                <strong style={styles.time}>
                  {formatTime(
                    attendance.checkInTime
                  )}
                </strong>
              </div>

              <div style={styles.timeBox}>
                <span style={styles.timeLabel}>
                  Check Out
                </span>

                <strong style={styles.time}>
                  {formatTime(
                    attendance.checkOutTime
                  )}
                </strong>
              </div>
            </div>

            {!attendance.checkOutTime && (
              <button
                onClick={handleCheckOut}
                disabled={checkingOut}
                style={styles.checkOutButton}
              >
                {checkingOut
                  ? "Checking location..."
                  : "Check Out"}
              </button>
            )}

            {attendance.checkOutTime && (
              <div style={styles.completed}>
                ✓ Attendance completed for today
              </div>
            )}
          </div>
        )}

        {message && (
          <div style={styles.message}>
            {message}
          </div>
        )}
      </div>

      <button
        onClick={() => navigate("/attendance/history")}
        style={styles.historyButton}
      >
        View Attendance History
      </button>
      <button onClick={() => navigate("/leaves")} style={styles.leaveButton}>My Leave</button>
    </div>
  );
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

  logoutButton: {
    padding: "10px 18px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#dc2626",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "14px",
  },

  headerActions: { display: "flex", alignItems: "center", gap: "10px" },

  profileButton: {
    padding: "10px 18px", border: "1px solid #d6ded8", borderRadius: "6px",
    backgroundColor: "#ffffff", color: "#25332f", cursor: "pointer", fontSize: "14px",
  },

  welcome: {
    padding: "35px 40px 20px",
  },
  policyText: { marginTop: "10px", color: "#5d6a64", fontSize: "13px", lineHeight: 1.5 },

  card: {
    margin: "20px 40px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "30px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    maxWidth: "700px",
  },

  cardTitle: {
    marginTop: 0,
    marginBottom: "25px",
  },

  statusBox: {
    textAlign: "center",
    padding: "35px",
    border: "1px solid #e1e7e2",
    borderRadius: "10px",
  },

  checkIcon: {
    fontSize: "50px",
    color: "#16a34a",
  },

  clockIcon: {
    fontSize: "50px",
  },

  present: {
    color: "#16a34a",
    marginBottom: "25px",
  },

  statusText: {
    color: "#66736d",
    marginBottom: "25px",
  },

  timeContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "50px",
    marginBottom: "30px",
  },

  timeBox: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  timeLabel: {
    color: "#66736d",
    fontSize: "14px",
  },

  time: {
    fontSize: "22px",
  },

  attendanceButton: {
    padding: "12px 24px",
    border: "none",
    borderRadius: "7px",
    backgroundColor: "#47796f",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "16px",
  },

  checkOutButton: {
    padding: "12px 24px",
    border: "none",
    borderRadius: "7px",
    backgroundColor: "#f59e0b",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "16px",
  },

  completed: {
    marginTop: "20px",
    color: "#16a34a",
    fontWeight: "600",
  },

  message: {
    marginTop: "20px",
    padding: "12px",
    backgroundColor: "#e8f1ed",
    color: "#35665e",
    borderRadius: "6px",
    textAlign: "center",
  },

  historyButton: {
  marginTop: "20px",
  padding: "12px 24px",
  border: "none",
  borderRadius: "7px",
  backgroundColor: "#47796f",
  color: "#ffffff",
  cursor: "pointer",
  fontSize: "15px",
},
  leaveButton: { margin: "20px 0 0 10px", padding: "12px 24px", border: "1px solid #d6ded8", borderRadius: "7px", backgroundColor: "#ffffff", color: "#25332f", cursor: "pointer", fontSize: "15px" },
  lateNote: { color: "#b45309", fontWeight: 600 },
  workedNote: { color: "#718079", fontSize: "14px" },
};

export default EmployeeDashboard;
