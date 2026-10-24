import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser(email.trim(), password);
      navigate(data.role === "ADMIN" ? "/admin" : "/employee");
    } catch (err) {
      console.error(err);
      setError("We couldn’t sign you in. Check your email and password, then try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-label="AttendPro sign in">
        <div className="auth-form-panel">
          <div className="brand-lockup">
            <span className="brand-mark" aria-hidden="true">A<span /></span>
            <span className="brand-name">Attend<span>Pro</span></span>
          </div>
          <div className="form-heading">
            <h1>Welcome back</h1>
            <p>Sign in to your AttendPro account.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="login-field">
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email address"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck="false"
                required
              />
            </div>

            <div className="login-field">
              <div className="password-label-row">
              <label htmlFor="login-password">Password</label>
                <Link to="/forgot-password">Forgot password?</Link>
              </div>
              <div className="password-input-wrap">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  className="password-toggle"
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && <p className="login-error" role="alert">{error}</p>}

            <button className="login-submit" type="submit" disabled={loading || !email.trim() || !password}>
              {loading ? <><span className="login-spinner" />Signing in…</> : <>Sign in <span aria-hidden="true">→</span></>}
            </button>
          </form>

          <p className="auth-help">Need help signing in? <span>Contact your administrator.</span></p>
          <p className="auth-copyright">AttendPro · Attendance Management System</p>
        </div>
      </section>
    </main>
  );
}

export default Login;
