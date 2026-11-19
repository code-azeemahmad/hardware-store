import React, { useEffect, useState } from "react";
import {
  FiShield,
  FiUserCheck,
  FiEdit,
  FiHeadphones,
  FiUserPlus,
  FiCopy,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAlertTriangle,
  FiSlash,
  FiCheck,
  FiUsers,
  FiLock,
  FiUser,
  FiMail,
} from "react-icons/fi";
import { apiListInvitations, apiListTeamMembers, apiCreateInvitation, apiRevokeInvitation } from "./api";
import type { AdminInvitation, AdminUser } from "./types";

interface Props {
  currentUser: AdminUser;
}

export const InvitationsView: React.FC<Props> = ({ currentUser }) => {
  const [invitations, setInvitations] = useState<AdminInvitation[]>([]);
  const [teamMembers, setTeamMembers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "catalogue_editor" | "enquiry_handler">("catalogue_editor");
  const [isCreating, setIsCreating] = useState(false);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isSuperAdmin = currentUser.role === "super_admin";

  const renderRoleBadge = (roleName: string) => {
    let icon = <FiUserCheck />;
    const label = roleName.replace("_", " ").toUpperCase();
    if (roleName === "super_admin") icon = <FiShield style={{ color: "#E21B23" }} />;
    else if (roleName === "admin") icon = <FiUserCheck style={{ color: "#2563EB" }} />;
    else if (roleName === "catalogue_editor") icon = <FiEdit style={{ color: "#059669" }} />;
    else if (roleName === "enquiry_handler") icon = <FiHeadphones style={{ color: "#D97706" }} />;

    return (
      <span
        className={`status-pill ${roleName === "super_admin" ? "published" : "complete"}`}
        style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
      >
        {icon}
        <span>{label}</span>
      </span>
    );
  };

  const loadData = async () => {
    if (!isSuperAdmin) return;
    setLoading(true);
    try {
      const [invs, team] = await Promise.all([
        apiListInvitations(),
        apiListTeamMembers().catch(() => []),
      ]);
      setInvitations(invs);
      setTeamMembers(team);
    } catch (err) {
      console.error("Failed to load invitations/team", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreatedUrl(null);
    setCopied(false);

    try {
      const res = await apiCreateInvitation(email, role);
      setCreatedUrl((res as any).invitation_link || res.invite_url);
      setEmail("");
      loadData();
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
      loadData();
    } catch (err: any) {
      alert("Failed to revoke invitation: " + err.message);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center" }}>
        <div style={{ marginBottom: "16px" }}>
          <FiLock style={{ fontSize: "2.5rem", color: "#DC2626" }} />
        </div>
        <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 8px 0" }}>Access Restricted</h3>
        <p style={{ color: "#6B7280", maxWidth: "400px", margin: "0 auto" }}>
          Only Super Administrators can manage team accounts and invite new staff members.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-action-bar">
        <div>
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <FiUsers style={{ color: "#E21B23" }} />
            <span>Staff Access &amp; Invitation Management</span>
          </h3>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#6B7280" }}>
            Public registration is forbidden. Administrators and editors are onboarded via single-use 72-hour invitation links.
          </p>
        </div>
      </div>

      {/* Active Team Members Section */}
      <div style={{ marginBottom: "32px" }}>
        <h4 style={{ margin: "0 0 12px 0", fontSize: "1rem", fontWeight: 700, color: "#111111", display: "inline-flex", alignItems: "center", gap: "8px" }}>
          <FiUsers style={{ color: "#E21B23" }} />
          <span>Active Administrative Team ({teamMembers.length})</span>
        </h4>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Assigned Role</th>
                <th>Account Status</th>
                <th>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "20px", color: "#6B7280" }}>
                    Loading team members...
                  </td>
                </tr>
              ) : (
                teamMembers.map((member) => (
                  <tr key={member.id}>
                    <td style={{ fontWeight: 600 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <FiUser style={{ color: "#6B7280" }} />
                        <span>{member.full_name}</span>
                        {member.id === currentUser.id && (
                          <span style={{ fontSize: "0.75rem", color: "#E21B23", fontWeight: 700 }}>(You)</span>
                        )}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <FiMail style={{ color: "#9CA3AF" }} />
                        <span>{member.email}</span>
                      </span>
                    </td>
                    <td>{renderRoleBadge(member.role)}</td>
                    <td>
                      <span
                        className={`status-pill ${member.is_active ? "complete" : "incomplete"}`}
                        style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                      >
                        {member.is_active ? (
                          <>
                            <FiCheckCircle style={{ color: "#059669" }} />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <FiXCircle style={{ color: "#DC2626" }} />
                            <span>Inactive</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "#6B7280" }}>
                      {member.last_login_at
                        ? new Date(member.last_login_at).toLocaleString()
                        : "Never"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
        <h4 style={{ margin: "0 0 16px 0", fontSize: "1rem", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "8px" }}>
          <FiUserPlus style={{ color: "#E21B23" }} />
          <span>Generate New Staff Invitation</span>
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

          <button
            type="submit"
            className="btn-admin btn-admin-primary"
            disabled={isCreating}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <FiUserPlus />
            <span>{isCreating ? "Generating..." : "Generate Invitation Token"}</span>
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
            <div style={{ fontWeight: 700, color: "#03543F", marginBottom: "6px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <FiCheckCircle style={{ fontSize: "1.1rem" }} />
              <span>Invitation Generated Successfully (Valid for 72 hours)</span>
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
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="btn-admin btn-admin-primary"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}
              >
                {copied ? <FiCheck /> : <FiCopy />}
                <span>{copied ? "Copied Link!" : "Copy Link"}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Invitations History Table */}
      <h4 style={{ margin: "0 0 12px 0", fontSize: "1rem", fontWeight: 700, color: "#111111", display: "inline-flex", alignItems: "center", gap: "8px" }}>
        <FiClock style={{ color: "#E21B23" }} />
        <span>Invitation Token History ({invitations.length})</span>
      </h4>
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
                    <td style={{ fontWeight: 600 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <FiMail style={{ color: "#9CA3AF" }} />
                        <span>{inv.email}</span>
                      </span>
                    </td>
                    <td>{renderRoleBadge(inv.role)}</td>
                    <td style={{ fontSize: "0.8rem", color: "#6B7280" }}>
                      {new Date(inv.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "#6B7280" }}>
                      {new Date(inv.expires_at).toLocaleString()}
                    </td>
                    <td>
                      {inv.is_revoked ? (
                        <span className="status-pill incomplete" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <FiSlash style={{ color: "#DC2626" }} />
                          <span>Revoked</span>
                        </span>
                      ) : isAccepted ? (
                        <span className="status-pill complete" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <FiCheckCircle style={{ color: "#059669" }} />
                          <span>Activated</span>
                        </span>
                      ) : isExpired ? (
                        <span className="status-pill draft" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <FiAlertTriangle style={{ color: "#6B7280" }} />
                          <span>Expired</span>
                        </span>
                      ) : (
                        <span className="status-pill missing-ur" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <FiClock style={{ color: "#D97706" }} />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {!inv.is_revoked && !isAccepted && (
                        <button
                          onClick={() => handleRevoke(inv.id)}
                          className="btn-admin btn-admin-danger btn-admin-sm"
                          style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                        >
                          <FiSlash />
                          <span>Revoke</span>
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
