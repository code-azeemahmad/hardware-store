import React, { useState } from "react";
import { apiLogin, apiGetMe } from "./api";
import type { AdminUser } from "./types";

interface Props {
  onLoginSuccess: (user: AdminUser) => void;
}

export const AdminLogin: React.FC<Props> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await apiLogin(email, password);
      const user = await apiGetMe();
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || "Invalid credentials or account inactive.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-container">
      <div className="admin-auth-card">
        <div className="admin-auth-header">
          <div style={{ fontSize: "2rem" }}>🔐</div>
          <h1 className="admin-auth-title">
            Naseer <span>Hardware</span>
          </h1>
          <p className="admin-auth-subtitle">Admin Control Panel</p>
        </div>

        {error && <div className="admin-alert admin-alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-email">
              Staff Email Address
            </label>
            <input
              id="admin-email"
              type="email"
              required
              className="form-input"
              placeholder="e.g. admin@naseerhardware.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              className="form-input"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn-admin btn-admin-primary"
            style={{ width: "100%", padding: "12px", marginTop: "12px" }}
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Sign In to Admin"}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "0.8rem", color: "#6B7280" }}>
          Protected Portal • Authorized Staff Only
        </div>
      </div>
    </div>
  );
};
