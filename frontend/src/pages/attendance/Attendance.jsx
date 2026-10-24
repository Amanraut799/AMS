import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getEmployees } from "../../services/api";
import { markAttendance } from "../../services/attendanceService";

function Attendance() {
  const { token } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [markedEmployees, setMarkedEmployees] = useState({});
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      setLoading(true);
      setError("");

      const data = await getEmployees(token);
      setEmployees(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load employees.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAttendance(employeeId) {
    try {
      setMarkingId(employeeId);
      setError("");

      await markAttendance(token, employeeId);

      setMarkedEmployees((previous) => ({
        ...previous,
        [employeeId]: true,
      }));
    } catch (err) {
      console.error(err);

      if (err.response?.status === 409) {
        setMarkedEmployees((previous) => ({
          ...previous,
          [employeeId]: true,
        }));

        setError(
          err.response?.data?.message ||
            "Attendance already marked for today."
        );
      } else {
        setError("Unable to mark attendance.");
      }
    } finally {
      setMarkingId(null);
    }
  }

  return (
    <div className="app-page-shell" style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Attendance</h1>
          <p style={styles.subtitle}>
            Mark today's employee attendance
          </p>
        </div>

        <Link to="/admin" style={styles.backButton}>
          Back to Dashboard
        </Link>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {loading ? (
        <p>Loading employees...</p>
      ) : employees.length === 0 ? (
        <div style={styles.empty}>
          No employees found.
        </div>
      ) : (
        <div style={styles.card}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Employee Code</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Department</th>
                <th style={styles.th}>Designation</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>

            <tbody>
              {employees.map((employee) => {
                const isMarked = markedEmployees[employee.id];

                return (
                  <tr key={employee.id}>
                    <td style={styles.td}>
                      {employee.employeeCode}
                    </td>

                    <td style={styles.td}>
                      {employee.firstName} {employee.lastName}
                    </td>

                    <td style={styles.td}>
                      {employee.department}
                    </td>

                    <td style={styles.td}>
                      {employee.designation}
                    </td>

                    <td style={styles.td}>
                      {isMarked ? (
                        <span style={styles.present}>
                          PRESENT
                        </span>
                      ) : (
                        <span style={styles.notMarked}>
                          NOT MARKED
                        </span>
                      )}
                    </td>

                    <td style={styles.td}>
                      {isMarked ? (
                        <button
                          disabled
                          style={styles.disabledButton}
                        >
                          ✓ Marked
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            handleMarkAttendance(employee.id)
                          }
                          disabled={markingId === employee.id}
                          style={styles.button}
                        >
                          {markingId === employee.id
                            ? "Marking..."
                            : "Mark Attendance"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "30px",
    backgroundColor: "#f3f5f2",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  },

  title: {
    margin: 0,
    fontSize: "30px",
  },

  subtitle: {
    marginTop: "6px",
    color: "#66736d",
  },

  backButton: {
    textDecoration: "none",
    padding: "10px 16px",
    backgroundColor: "#ffffff",
    color: "#333",
    borderRadius: "6px",
    border: "1px solid #ddd",
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    padding: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: "14px",
    borderBottom: "2px solid #eee",
  },

  td: {
    padding: "14px",
    borderBottom: "1px solid #eee",
  },

  present: {
    color: "#16a34a",
    fontWeight: "600",
  },

  notMarked: {
    color: "#dc2626",
    fontWeight: "600",
  },

  button: {
    padding: "9px 14px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#47796f",
    color: "#ffffff",
    cursor: "pointer",
  },

  disabledButton: {
    padding: "9px 14px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#16a34a",
    color: "#ffffff",
    cursor: "default",
  },

  error: {
    padding: "12px 15px",
    marginBottom: "20px",
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    borderRadius: "6px",
  },

  empty: {
    backgroundColor: "#ffffff",
    padding: "30px",
    borderRadius: "10px",
    textAlign: "center",
  },
};

export default Attendance;
