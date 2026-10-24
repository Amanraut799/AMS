import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getEmployees, updateEmployee } from "../../services/api";

function EditEmployee() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    employeeCode: "",
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEmployee() {
      try {
        setLoading(true);
        setError("");

        const employees = await getEmployees(token);

        const employee = employees.find(
          (item) => item.id === Number(id)
        );

        if (!employee) {
          setError("Employee not found.");
          return;
        }

        setForm({
          employeeCode: employee.employeeCode || "",
          firstName: employee.firstName || "",
          lastName: employee.lastName || "",
          email: employee.email || "",
          phone: employee.phone || "",
          department: employee.department || "",
          designation: employee.designation || "",
          employeeType: employee.employeeType || "DESK",
          joiningDate: employee.joiningDate || "",
          active: employee.active ?? true,
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load employee.");
      } finally {
        setLoading(false);
      }
    }

    loadEmployee();
  }, [id, token]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      await updateEmployee(token, id, form);

      navigate("/employees");
    } catch (err) {
      console.error(err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to update employee.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={styles.message}>
        Loading employee...
      </div>
    );
  }

  if (error && !form.employeeCode) {
    return (
      <div style={styles.page}>
        <div style={styles.errorBox}>
          {error}
        </div>

        <Link to="/employees" style={styles.backLink}>
          ← Back to Employees
        </Link>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Edit Employee</h1>
            <p style={styles.subtitle}>
              Update employee information
            </p>
          </div>

          <Link to="/employees" style={styles.backLink}>
            ← Back
          </Link>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>

          <div style={styles.grid}>

            <div style={styles.field}>
              <label>Employee Code *</label>
              <input
                name="employeeCode"
                value={form.employeeCode}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label>First Name *</label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
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
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label>Department</label>
              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label>Designation</label>
              <input
                name="designation"
                value={form.designation}
                onChange={handleChange}
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
            <div style={styles.errorBox}>
              {error}
            </div>
          )}

          <div style={styles.actions}>
            <Link to="/employees" style={styles.cancel}>
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              style={styles.submit}
            >
              {saving ? "Saving..." : "Save Changes"}
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
    backgroundColor: "#f3f5f2",
    padding: "30px",
    boxSizing: "border-box",
    fontFamily: "Arial, sans-serif",
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
    color: "#718079",
    marginTop: "8px",
  },

  backLink: {
    color: "#47796f",
    textDecoration: "none",
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
    border: "1px solid #d6ded8",
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

  errorBox: {
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
    border: "1px solid #d6ded8",
    textDecoration: "none",
    color: "#45534e",
  },

  submit: {
    padding: "12px 20px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#47796f",
    color: "#ffffff",
    fontWeight: "bold",
    cursor: "pointer",
  },

  message: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f5f2",
    fontFamily: "Arial, sans-serif",
  },
};

export default EditEmployee;
