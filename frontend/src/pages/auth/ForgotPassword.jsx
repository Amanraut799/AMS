import { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../../services/authService";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await requestPasswordReset(email.trim());
      setMessage(response.message);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "We could not process your request right now. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <p style={styles.brand}>AttendPro</p>
        <h1 style={styles.title}>Reset your password</h1>
        <p style={styles.description}>
          Enter your employee account email and we’ll send a secure reset link if the account is eligible.
        </p>

        <form onSubmit={handleSubmit}>
          <label style={styles.field}>
            <span>Email address</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              style={styles.input}
            />
          </label>

          {message && <p role="status" style={styles.success}>{message}</p>}
          {error && <p role="alert" style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <Link to="/login" style={styles.backLink}>Back to login</Link>
      </section>
    </main>
  );
}

const styles = {
  page: { minHeight: "100vh", display: "grid", placeItems: "center", padding: 20, background: "#f4f6f8" },
  card: { width: "100%", maxWidth: 440, padding: 36, borderRadius: 14, background: "#fff", boxShadow: "0 8px 30px rgba(15,23,42,.08)" },
  brand: { margin: "0 0 22px", color: "#2563eb", fontSize: 22, fontWeight: 700 },
  title: { margin: 0, color: "#1f2937", fontSize: 26 },
  description: { margin: "10px 0 24px", color: "#64748b", lineHeight: 1.5 },
  field: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 18, color: "#374151", fontSize: 14, fontWeight: 600 },
  input: { padding: "12px 13px", border: "1px solid #cbd5e1", borderRadius: 7, fontSize: 15 },
  button: { width: "100%", padding: 12, border: 0, borderRadius: 7, background: "#2563eb", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer" },
  backLink: { display: "inline-block", marginTop: 20, color: "#2563eb", fontSize: 14, textDecoration: "none" },
  success: { marginBottom: 16, padding: 12, borderRadius: 7, background: "#dcfce7", color: "#166534", fontSize: 14, lineHeight: 1.5 },
  error: { marginBottom: 16, padding: 12, borderRadius: 7, background: "#fee2e2", color: "#b91c1c", fontSize: 14, lineHeight: 1.5 },
};

export default ForgotPassword;
