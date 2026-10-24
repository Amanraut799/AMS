import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMyProfile } from "../../services/api";
import "./UserProfile.css";

function UserProfile() {
  const { token, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getMyProfile(token)
      .then((data) => { if (active) setProfile(data); })
      .catch((requestError) => {
        console.error(requestError);
        if (active) setError("We couldn't load your profile. Please try again.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  const home = user?.role === "ADMIN" ? "/admin" : "/employee";
  const fullName = profile ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim() : "";
  const initials = fullName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <main className="profile-page">
      <header className="profile-topbar">
        <Link className="profile-brand" to={home}>AttendPro</Link>
        <Link className="profile-back" to={home}>← Back to dashboard</Link>
      </header>

      <section className="profile-content">
        <div className="profile-heading">
          <div>
            <p className="profile-eyebrow">ACCOUNT</p>
            <h1>My profile</h1>
            <p className="profile-muted">Your account and employment information.</p>
          </div>
          {profile && <span className={`profile-status ${profile.active ? "is-active" : "is-inactive"}`}>{profile.active ? "Active account" : "Inactive account"}</span>}
        </div>

        {loading && <div className="profile-panel profile-message">Loading your profile…</div>}
        {error && <div className="profile-error" role="alert">{error}</div>}

        {!loading && !error && profile && (
          <>
            <section className="profile-identity profile-panel">
              <div className="profile-avatar" aria-hidden="true">{initials || "U"}</div>
              <div className="profile-identity-copy">
                <h2>{fullName || "User"}</h2>
                <p>{profile.designation || (profile.role === "ADMIN" ? "Administrator" : "Employee")}</p>
              </div>
              <span className="profile-role">{profile.role}</span>
            </section>

            <section className="profile-panel">
              <div className="profile-section-title">
                <div><h2>Personal information</h2><p>Contact details associated with your account.</p></div>
              </div>
              <div className="profile-grid">
                <ProfileField label="First name" value={profile.firstName} />
                <ProfileField label="Last name" value={profile.lastName} />
                <ProfileField label="Email address" value={profile.email} />
                <ProfileField label="Phone" value={profile.phone} />
              </div>
            </section>

            <section className="profile-panel">
              <div className="profile-section-title">
                <div><h2>Employment information</h2><p>Your role and organization details.</p></div>
              </div>
              <div className="profile-grid">
                <ProfileField label="Employee code" value={profile.employeeCode} />
                <ProfileField label="Employee type" value={profile.employeeType === "FIELD" ? "Field officer" : profile.employeeType === "DESK" ? "Desk employee" : null} />
                <ProfileField label="Department" value={profile.department} />
                <ProfileField label="Designation" value={profile.designation} />
                <ProfileField label="Joining date" value={profile.joiningDate ? new Date(`${profile.joiningDate}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : null} />
              </div>
              {profile.role === "ADMIN" && !profile.employeeCode && <p className="profile-note">This account does not have an employee record.</p>}
            </section>

            <p className="profile-footnote">To update your information, contact your administrator.</p>
          </>
        )}
      </section>
    </main>
  );
}

function ProfileField({ label, value }) {
  return <div className="profile-field"><span>{label}</span><strong>{value || "Not provided"}</strong></div>;
}

export default UserProfile;
