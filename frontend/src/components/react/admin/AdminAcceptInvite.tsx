import React, { useState } from "react";
import { FiUserCheck, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";
import { apiAcceptInvite } from "./api";

interface Props {
  token: string;
  onSuccess: () => void;
}

export const AdminAcceptInvite: React.FC<Props> = ({ token, onSuccess }) => {
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      await apiAcceptInvite({
        token,
        full_name: fullName,
        password,
      });
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to activate account. The invitation may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-container">
      <div className="admin-auth-card">
        <div className="admin-auth-header">
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(226, 27, 35, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FiUserCheck style={{ fontSize: "1.75rem", color: "#E21B23" }} />
            </div>
          </div>
          <h1 className="admin-auth-title">Welcome to the Team</h1>
          <p className="admin-auth-subtitle">Activate Your Naseer Hardware Admin Account</p>
        </div>

        {error && (
          <div className="admin-alert admin-alert-error" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FiAlertTriangle />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="admin-alert admin-alert-success" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FiCheckCircle />
            <span>Account activated successfully! Redirecting to login...</span>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="invite-name">
                Your Full Name
              </label>
              <input
                id="invite-name"
                type="text"
                required
                className="form-input"
                placeholder="e.g. Tariq Mahmood"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="invite-password">
                Create Password (min. 8 characters)
              </label>
              <input
                id="invite-password"
                type="password"
                required
                minLength={8}
                className="form-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="invite-confirm-password">
                Confirm Password
              </label>
              <input
                id="invite-confirm-password"
                type="password"
                required
                minLength={8}
                className="form-input"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn-admin btn-admin-primary"
              style={{ width: "100%", padding: "12px", marginTop: "12px" }}
              disabled={loading}
            >
              {loading ? "Activating..." : "Complete Setup & Sign In"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
