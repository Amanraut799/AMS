import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getEmployees, deleteEmployee, syncEmployeeLoginAccounts } from "../../services/api";

function Employees() {
  const { token } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [syncingAccounts, setSyncingAccounts] = useState(false);
  const [accountMessage, setAccountMessage] = useState("");

  async function loadEmployees() {
    try {
      setLoading(true);
      setError("");

      const data = await getEmployees(token);
      setEmployees(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load employees.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteEmployee(token, id);

      setEmployees((currentEmployees) =>
        currentEmployees.filter((employee) => employee.id !== id)
      );
    } catch (err) {
      console.error(err);
      alert("Failed to delete employee.");
    }
  }

  async function handleSyncLoginAccounts() {
    const confirmed = window.confirm(
      "Create login accounts for active employees who are missing one? New accounts get a random password. Employees must use Forgot Password to set their password, so email delivery must be configured."
    );

    if (!confirmed) return;

    setSyncingAccounts(true);
    setAccountMessage("");
    setError("");

    try {
      const result = await syncEmployeeLoginAccounts(token);
      const created = result.createdEmployeeCodes?.length
        ? `Created login accounts for: ${result.createdEmployeeCodes.join(", ")}.`
        : "No missing active employee login accounts were found.";
      const conflicts = result.conflictingEmployeeCodes?.length
        ? ` Check these employee codes for an email or account conflict: ${result.conflictingEmployeeCodes.join(", ")}.`
        : "";
      setAccountMessage(`${created}${conflicts} Employees can set their password using the forgot-password link.`);
    } catch (syncError) {
      console.error(syncError);
      setError(syncError.response?.data?.message || "Unable to create the missing login accounts.");
    } finally {
      setSyncingAccounts(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Employees</h1>
          <p style={styles.subtitle}>
            Manage all employees in AttendPro
          </p>
        </div>

        <div style={styles.headerActions}>
          <button
            type="button"
            onClick={handleSyncLoginAccounts}
            style={styles.syncButton}
            disabled={syncingAccounts}
          >
            {syncingAccounts ? "Creating logins..." : "Create Missing Logins"}
          </button>
          <Link to="/employees/add" style={styles.addButton}>
            + Add Employee
          </Link>
        </div>
      </div>

      {accountMessage && <div role="status" style={styles.success}>{accountMessage}</div>}

      {loading && (
        <div style={styles.message}>
          Loading employees...
        </div>
      )}

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Code</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Department</th>
                <th style={styles.th}>Designation</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Joining Date</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="9" style={styles.empty}>
                    No employees found.
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee.id}>
                    <td style={styles.td}>
                      {employee.employeeCode}
                    </td>

                    <td style={styles.td}>
                      {employee.firstName} {employee.lastName}
                    </td>

                    <td style={styles.td}>
                      {employee.email}
                    </td>

                    <td style={styles.td}>
                      {employee.department || "-"}
                    </td>

                    <td style={styles.td}>
                      {employee.designation || "-"}
                    </td>

                    <td style={styles.td}>{employee.employeeType === "FIELD" ? "Field officer" : "Desk"}</td>

                    <td style={styles.td}>
                      {employee.joiningDate || "-"}
                    </td>

                    <td style={styles.td}>
                      <span
                        style={
                          employee.active
                            ? styles.active
                            : styles.inactive
                        }
                      >
                        {employee.active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <Link
                        to={`/employees/edit/${employee.id}`}
                        style={styles.editButton}
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => handleDelete(employee.id)}
                        style={styles.deleteButton}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div style={styles.back}>
        <Link to="/admin">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f3f5f2",
    padding: "30px",
    boxSizing: "border-box",
    fontFamily: "Arial, sans-serif",
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
    color: "#718079",
    marginTop: "8px",
  },

  addButton: {
    backgroundColor: "#47796f",
    color: "#ffffff",
    textDecoration: "none",
    padding: "12px 18px",
    borderRadius: "6px",
    fontWeight: "bold",
  },

  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },

  syncButton: {
    border: "1px solid #d6ded8",
    backgroundColor: "#ffffff",
    color: "#25332f",
    padding: "11px 15px",
    borderRadius: "6px",
    fontWeight: 600,
    cursor: "pointer",
  },

  success: {
    marginBottom: "18px",
    padding: "14px 16px",
    borderRadius: "8px",
    backgroundColor: "#dcfce7",
    color: "#166534",
    lineHeight: 1.5,
  },

  tableContainer: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    overflowX: "auto",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.06)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1000px",
  },

  th: {
    textAlign: "left",
    padding: "15px",
    borderBottom: "1px solid #e1e7e2",
    backgroundColor: "#f7f8f6",
    fontSize: "14px",
  },

  td: {
    padding: "15px",
    borderBottom: "1px solid #e1e7e2",
    fontSize: "14px",
  },

  active: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    padding: "5px 10px",
    borderRadius: "15px",
    fontSize: "12px",
    fontWeight: "bold",
  },

  inactive: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    padding: "5px 10px",
    borderRadius: "15px",
    fontSize: "12px",
    fontWeight: "bold",
  },

  editButton: {
    color: "#47796f",
    textDecoration: "none",
    marginRight: "10px",
    fontWeight: "bold",
  },

  deleteButton: {
    border: "none",
    backgroundColor: "#dc2626",
    color: "#ffffff",
    padding: "7px 10px",
    borderRadius: "5px",
    cursor: "pointer",
  },

  message: {
    backgroundColor: "#ffffff",
    padding: "30px",
    borderRadius: "10px",
  },

  error: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    padding: "15px",
    borderRadius: "8px",
  },

  empty: {
    textAlign: "center",
    padding: "40px",
    color: "#718079",
  },

  back: {
    marginTop: "25px",
  },
};

export default Employees;
