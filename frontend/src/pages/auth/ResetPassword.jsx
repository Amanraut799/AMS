import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../services/authService";

function ResetPassword() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [token] = useState(() => searchParams.get("token") || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.has("token")) {
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await resetPassword(token, password);
      setMessage(response.message);
      setPassword("");
      setConfirmPassword("");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "We could not reset your password. Request a new reset link and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <p style={styles.brand}>AttendPro</p>
        <h1 style={styles.title}>Choose a new password</h1>
        {!token ? (
          <p role="alert" style={styles.error}>
            This reset link is incomplete. Request a new password reset link.
          </p>
        ) : message ? (
          <p role="status" style={styles.success}>{message}</p>
        ) : (
          <>
            <p style={styles.description}>Use at least 8 characters for your new password.</p>
            <form onSubmit={handleSubmit}>
              <label style={styles.field}>
                <span>New password</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={72}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  style={styles.input}
                />
              </label>
              <label style={styles.field}>
                <span>Confirm new password</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={72}
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  style={styles.input}
                />
              </label>
              {error && <p role="alert" style={styles.error}>{error}</p>}
              <button type="submit" disabled={loading} style={styles.button}>
                {loading ? "Updating..." : "Update password"}
              </button>
            </form>
          </>
        )}
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
  field: { display: "flex", flexDirection: "column", gap: 8, margin: "18px 0", color: "#374151", fontSize: 14, fontWeight: 600 },
  input: { padding: "12px 13px", border: "1px solid #cbd5e1", borderRadius: 7, fontSize: 15 },
  button: { width: "100%", padding: 12, border: 0, borderRadius: 7, background: "#2563eb", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer" },
  backLink: { display: "inline-block", marginTop: 20, color: "#2563eb", fontSize: 14, textDecoration: "none" },
  success: { marginTop: 18, padding: 12, borderRadius: 7, background: "#dcfce7", color: "#166534", fontSize: 14, lineHeight: 1.5 },
  error: { margin: "16px 0", padding: 12, borderRadius: 7, background: "#fee2e2", color: "#b91c1c", fontSize: 14, lineHeight: 1.5 },
};

export default ResetPassword;
