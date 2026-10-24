import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await loginUser(email, password);

      if (data.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/employee");
      }

    } catch (err) {
      console.error(err);

      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>

      <div style={styles.card}>

        <h1 style={styles.title}>AttendPro</h1>

        <p style={styles.subtitle}>
          Attendance Management System
        </p>

        <h2 style={styles.heading}>Login</h2>

        <form onSubmit={handleSubmit}>

          <div style={styles.field}>
            <label>Email</label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.forgotRow}>
            <Link to="/forgot-password" style={styles.forgotLink}>
              Employee? Forgot your password?
            </Link>
          </div>

          <div style={styles.field}>
            <label>Password</label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
              style={styles.input}
            />
          </div>

          {error && (
            <p style={styles.error}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

      </div>

    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f6f8",
  },

  card: {
    width: "400px",
    padding: "40px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
  },

  title: {
    margin: 0,
    textAlign: "center",
    fontSize: "32px",
  },

  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: "30px",
  },

  heading: {
    marginBottom: "20px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "18px",
  },

  input: {
    padding: "12px",
    fontSize: "16px",
    border: "1px solid #ccc",
    borderRadius: "6px",
  },

  button: {
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    backgroundColor: "#2563eb",
    color: "#ffffff",
  },

  error: {
    color: "#dc2626",
    marginBottom: "15px",
  },

  forgotRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "-6px",
    marginBottom: "18px",
  },

  forgotLink: {
    color: "#2563eb",
    fontSize: "14px",
    textDecoration: "none",
  },
};

export default Login;
