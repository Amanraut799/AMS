import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createEmployee } from "../../services/api";

function AddEmployee() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    employeeType: "DESK",
    joiningDate: "",
    active: true,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Stores the credentials returned by backend
  const [registrationResult, setRegistrationResult] = useState(null);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await createEmployee(token, form);

      console.log("Employee registration response:", response);

      // Save employee + temporary password
      setRegistrationResult(response);

    } catch (err) {
      console.error(err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to create employee.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Show credentials after successful registration
  if (registrationResult) {
    const employee = registrationResult.employee;

    return (
      <div style={styles.page}>
        <div style={styles.successContainer}>

          <div style={styles.successIcon}>
            ✓
          </div>

          <h1 style={styles.successTitle}>
            Employee Registered Successfully
          </h1>

          <p style={styles.successSubtitle}>
            The employee account has been created.
          </p>

          <div style={styles.credentialsCard}>

            <div style={styles.credentialRow}>
              <span style={styles.credentialLabel}>
                Employee Code
              </span>

              <strong style={styles.credentialValue}>
                {employee.employeeCode}
              </strong>
            </div>

            <div style={styles.credentialRow}>
              <span style={styles.credentialLabel}>
                Employee Name
              </span>

              <strong style={styles.credentialValue}>
                {employee.firstName} {employee.lastName}
              </strong>
            </div>

            <div style={styles.credentialRow}>
              <span style={styles.credentialLabel}>
                Login Email
              </span>

              <strong style={styles.credentialValue}>
                {employee.email}
              </strong>
            </div>

            <div style={styles.passwordBox}>

              <span style={styles.credentialLabel}>
                Temporary Password
              </span>

              <div style={styles.passwordRow}>

                <strong style={styles.password}>
                  {registrationResult.temporaryPassword}
                </strong>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      registrationResult.temporaryPassword
                    );
                  }}
                  style={styles.copyButton}
                >
                  Copy
                </button>

              </div>

            </div>

          </div>

          <div style={styles.warning}>
            ⚠️ Save or copy this temporary password now.
            You should provide it to the employee securely.
          </div>

          <div style={styles.successActions}>

            <button
              type="button"
              onClick={() => navigate("/employees")}
              style={styles.primaryButton}
            >
              Go to Employees
            </button>

            <button
              type="button"
              onClick={() => {
                setRegistrationResult(null);

                setForm({
                  firstName: "",
                  lastName: "",
                  email: "",
                  phone: "",
                  department: "",
                  designation: "",
                  employeeType: "DESK",
                  joiningDate: "",
                  active: true,
                });
              }}
              style={styles.secondaryButton}
            >
              Register Another Employee
            </button>

          </div>

        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              Add Employee
            </h1>

            <p style={styles.subtitle}>
              Create a new employee account
            </p>
          </div>

          <Link
            to="/employees"
            style={styles.backButton}
          >
            ← Back
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          style={styles.form}
        >

          <div style={styles.grid}>

            <div style={styles.field}>
              <label>First Name *</label>

              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="Rahul"
                required
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label>Last Name *</label>

              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Sharma"
                required
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label>Email *</label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="employee@attendpro.com"
                required
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label>Phone</label>

              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="9876543210"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label>Department</label>

              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="IT"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label>Designation</label>

              <input
                name="designation"
                value={form.designation}
                onChange={handleChange}
                placeholder="Software Developer"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label>Employee Type *</label>
              <select name="employeeType" value={form.employeeType} onChange={handleChange} style={styles.input}>
                <option value="DESK">Desk employee</option>
                <option value="FIELD">Field officer</option>
              </select>
            </div>

            <div style={styles.field}>
              <label>Joining Date</label>

              <input
                type="date"
                name="joiningDate"
                value={form.joiningDate}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

          </div>

          <label style={styles.checkbox}>
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleChange}
            />

            Active Employee
          </label>

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          <div style={styles.actions}>

            <Link
              to="/employees"
              style={styles.cancel}
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              style={styles.submit}
            >
              {loading
                ? "Creating..."
                : "Create Employee"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}

const styles = {

  page: {
    minHeight: "100vh",
    backgroundColor: "#f5f7fb",
    padding: "30px",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
  },

  container: {
    maxWidth: "1000px",
    margin: "0 auto",
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
    color: "#6b7280",
    marginTop: "8px",
  },

  backButton: {
    textDecoration: "none",
    color: "#2563eb",
    fontWeight: "bold",
  },

  form: {
    backgroundColor: "#ffffff",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.06)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  input: {
    padding: "12px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "15px",
    boxSizing: "border-box",
  },

  checkbox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "25px",
  },

  error: {
    marginTop: "20px",
    padding: "12px",
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    borderRadius: "6px",
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "30px",
  },

  cancel: {
    padding: "12px 20px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    textDecoration: "none",
    color: "#374151",
  },

  submit: {
    padding: "12px 20px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontWeight: "bold",
    cursor: "pointer",
  },

  successContainer: {
    maxWidth: "650px",
    margin: "50px auto",
    backgroundColor: "#ffffff",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 2px 15px rgba(0, 0, 0, 0.08)",
    textAlign: "center",
  },

  successIcon: {
    width: "60px",
    height: "60px",
    margin: "0 auto 20px",
    borderRadius: "50%",
    backgroundColor: "#dcfce7",
    color: "#15803d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    fontWeight: "bold",
  },

  successTitle: {
    margin: 0,
    color: "#166534",
    fontSize: "26px",
  },

  successSubtitle: {
    color: "#6b7280",
    marginTop: "8px",
  },

  credentialsCard: {
    marginTop: "30px",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    overflow: "hidden",
    textAlign: "left",
  },

  credentialRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid #e5e7eb",
  },

  credentialLabel: {
    color: "#6b7280",
    fontSize: "14px",
  },

  credentialValue: {
    color: "#111827",
    fontSize: "15px",
  },

  passwordBox: {
    padding: "20px",
    backgroundColor: "#f9fafb",
  },

  passwordRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
    marginTop: "8px",
  },

  password: {
    fontSize: "20px",
    color: "#111827",
    letterSpacing: "1px",
  },

  copyButton: {
    padding: "8px 15px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    cursor: "pointer",
  },

  warning: {
    marginTop: "20px",
    padding: "14px",
    backgroundColor: "#fff7ed",
    color: "#9a3412",
    borderRadius: "7px",
    fontSize: "14px",
    textAlign: "left",
  },

  successActions: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    marginTop: "25px",
    flexWrap: "wrap",
  },

  primaryButton: {
    padding: "12px 20px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "bold",
  },

  secondaryButton: {
    padding: "12px 20px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    backgroundColor: "#ffffff",
    color: "#374151",
    cursor: "pointer",
  },
};

export default AddEmployee;
