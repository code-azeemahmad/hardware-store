import React, { useEffect, useState } from "react";
import { apiListInvitations, apiCreateInvitation, apiRevokeInvitation } from "./api";
import type { AdminInvitation, AdminUser } from "./types";

interface Props {
  currentUser: AdminUser;
}

export const InvitationsView: React.FC<Props> = ({ currentUser }) => {
  const [invitations, setInvitations] = useState<AdminInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "catalogue_editor" | "enquiry_handler">("catalogue_editor");
  const [isCreating, setIsCreating] = useState(false);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);

  const isSuperAdmin = currentUser.role === "super_admin";

  const loadInvitations = async () => {
    if (!isSuperAdmin) return;
    setLoading(true);
    try {
      const data = await apiListInvitations();
      setInvitations(data);
    } catch (err) {
      console.error("Failed to load invitations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  const handleCreate = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreatedUrl(null);

    try {
      const res = await apiCreateInvitation(email, role);
      setCreatedUrl(res.invite_url);
      setEmail("");
      loadInvitations();
    } catch (err: any) {
      alert("Failed to generate invitation: " + err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this invitation?")) return;
    try {
      await apiRevokeInvitation(id);
      loadInvitations();
    } catch (err: any) {
      alert("Failed to revoke invitation: " + err.message);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h3>Access Restricted</h3>
        <p style={{ color: "#6B7280" }}>Only Super Administrators can invite new staff members.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-action-bar">
        <div>
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>
            Staff Access & Invitation Management
          </h3>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#6B7280" }}>
            Public registration is forbidden. Administrators and editors are onboarded via single-use 72-hour invitation links.
          </p>
        </div>
      </div>

      {/* Invitation Form Card */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: "8px",
          padding: "24px",
          marginBottom: "28px",
        }}
      >
        <h4 style={{ margin: "0 0 16px 0", fontSize: "1rem", fontWeight: 600 }}>
          Generate New Staff Invitation
        </h4>

        <form onSubmit={handleCreate} style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flexGrow: 1, minWidth: "240px" }}>
            <label className="form-label">Recipient Email Address *</label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="e.g. staff.member@naseerhardware.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div style={{ width: "200px" }}>
            <label className="form-label">Authorized Role *</label>
            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
            >
              <option value="catalogue_editor">Catalogue Editor</option>
              <option value="enquiry_handler">Enquiry Handler</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <button type="submit" className="btn-admin btn-admin-primary" disabled={isCreating}>
            {isCreating ? "Generating..." : "Generate Invitation Token"}
          </button>
        </form>

        {createdUrl && (
          <div
            style={{
              marginTop: "20px",
              padding: "16px",
              background: "#DEF7EC",
              border: "1px solid #84E1BC",
              borderRadius: "6px",
            }}
          >
            <div style={{ fontWeight: 700, color: "#03543F", marginBottom: "6px" }}>
              ✓ Invitation Generated Successfully (Valid for 72 hours)
            </div>
            <p style={{ margin: "0 0 10px 0", fontSize: "0.85rem", color: "#065F46" }}>
              Provide this private activation URL to the recipient to complete their onboarding:
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                readOnly
                value={createdUrl}
                className="form-input"
                style={{ background: "#FFFFFF", fontFamily: "monospace", fontSize: "0.85rem" }}
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(createdUrl);
                  alert("Activation link copied to clipboard!");
                }}
                className="btn-admin btn-admin-primary"
              >
                Copy Link
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Invitations History Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Invited Email</th>
              <th>Assigned Role</th>
              <th>Created</th>
              <th>Expires</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "30px", color: "#6B7280" }}>
                  Loading invitations...
                </td>
              </tr>
            ) : invitations.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "30px", color: "#6B7280" }}>
                  No active invitations.
                </td>
              </tr>
            ) : (
              invitations.map((inv) => {
                const isAccepted = !!inv.accepted_at;
                const isExpired = new Date(inv.expires_at) < new Date();
                return (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 600 }}>{inv.email}</td>
                    <td>
                      <span className="status-pill published">
                        {inv.role.replace("_", " ").toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "#6B7280" }}>
                      {new Date(inv.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "#6B7280" }}>
                      {new Date(inv.expires_at).toLocaleString()}
                    </td>
                    <td>
                      {inv.is_revoked ? (
                        <span className="status-pill incomplete">Revoked</span>
                      ) : isAccepted ? (
                        <span className="status-pill complete">✓ Activated</span>
                      ) : isExpired ? (
                        <span className="status-pill draft">Expired</span>
                      ) : (
                        <span className="status-pill missing-ur">Pending</span>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {!inv.is_revoked && !isAccepted && (
                        <button
                          onClick={() => handleRevoke(inv.id)}
                          className="btn-admin btn-admin-danger btn-admin-sm"
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
