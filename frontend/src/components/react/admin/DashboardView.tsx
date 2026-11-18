import React, { useEffect, useState } from "react";
import { apiGetMetrics, apiTriggerBuild, apiGetBuildStatus } from "./api";
import type { DashboardMetrics, BuildStatus } from "./types";

interface Props {
  onNavigate: (tab: string, filter?: string) => void;
}

export const DashboardView: React.FC<Props> = ({ onNavigate }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [buildStatus, setBuildStatus] = useState<BuildStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggeringBuild, setTriggeringBuild] = useState(false);

  const loadData = async () => {
    try {
      const [m, b] = await Promise.all([apiGetMetrics(), apiGetBuildStatus()]);
      setMetrics(m);
      setBuildStatus(b);
    } catch (err) {
      console.error("Failed to load dashboard metrics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerBuild = async () => {
    setTriggeringBuild(true);
    try {
      const status = await apiTriggerBuild();
      setBuildStatus(status);
      setTimeout(loadData, 2000);
    } catch (err: any) {
      alert(err.message || "Failed to trigger site rebuild.");
    } finally {
      setTriggeringBuild(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Loading metrics...</div>;
  }

  return (
    <div>
      {/* Top Banner with Site Status & Rebuild Action */}
      <div
        className="admin-action-bar"
        style={{
          background: "#FFFFFF",
          borderLeft: "4px solid #E21B23",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>
            Naseer Hardware & Plywood Sargodha — Catalogue Control
          </h3>
          <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#6B7280" }}>
            Production SSG Status:{" "}
            <strong>
              {buildStatus?.status === "building"
                ? "⚙️ Generating Static Site..."
                : buildStatus?.status === "success"
                ? "🟢 Live & Synchronized"
                : "⚪ Idle"}
            </strong>
            {buildStatus?.last_built_at && (
              <span>
                {" "}
                (Last updated {new Date(buildStatus.last_built_at).toLocaleTimeString()})
              </span>
            )}
          </p>
        </div>

        <button
          onClick={handleTriggerBuild}
          disabled={triggeringBuild || buildStatus?.status === "building"}
          className="btn-admin btn-admin-primary"
        >
          {triggeringBuild || buildStatus?.status === "building"
            ? "Rebuilding Static Pages..."
            : "🚀 Trigger Site Rebuild"}
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="admin-kpi-grid">
        <div
          className="admin-kpi-card"
          onClick={() => onNavigate("products")}
          style={{ cursor: "pointer" }}
        >
          <div className="admin-kpi-label">Catalogue Products</div>
          <div className="admin-kpi-value">{metrics?.total_products || 0}</div>
          <div className="admin-kpi-badge success">
            {metrics?.published_products || 0} Published Live
          </div>
        </div>

        <div
          className="admin-kpi-card"
          onClick={() => onNavigate("categories")}
          style={{ cursor: "pointer" }}
        >
          <div className="admin-kpi-label">Active Categories</div>
          <div className="admin-kpi-value">{metrics?.total_categories || 0}</div>
          <div className="admin-kpi-badge success">Hardware, Plywood, Kitchen, Bathroom</div>
        </div>

        <div
          className="admin-kpi-card"
          onClick={() => onNavigate("brands")}
          style={{ cursor: "pointer" }}
        >
          <div className="admin-kpi-label">Partner Brands</div>
          <div className="admin-kpi-value">{metrics?.total_brands || 0}</div>
          <div className="admin-kpi-badge success">All Verified Brands</div>
        </div>

        <div
          className="admin-kpi-card"
          onClick={() => onNavigate("enquiries")}
          style={{ cursor: "pointer" }}
        >
          <div className="admin-kpi-label">Customer Leads & Enquiries</div>
          <div className="admin-kpi-value">{metrics?.total_enquiries || 0}</div>
          <div
            className={`admin-kpi-badge ${
              (metrics?.new_enquiries || 0) > 0 ? "alert" : "success"
            }`}
          >
            {metrics?.new_enquiries || 0} Unresolved New
          </div>
        </div>

        {/* Translation Quality KPI Card */}
        <div
          className="admin-kpi-card"
          onClick={() => onNavigate("products", "missing_ur")}
          style={{
            cursor: "pointer",
            border: (metrics?.missing_urdu_translations || 0) > 0 ? "1px solid #F59E0B" : "1px solid #E5E7EB",
          }}
        >
          <div className="admin-kpi-label">Urdu Localization Health</div>
          <div
            className="admin-kpi-value"
            style={{
              color: (metrics?.missing_urdu_translations || 0) > 0 ? "#D97706" : "#059669",
            }}
          >
            {metrics?.missing_urdu_translations || 0}
          </div>
          <div
            className={`admin-kpi-badge ${
              (metrics?.missing_urdu_translations || 0) > 0 ? "alert" : "success"
            }`}
          >
            {(metrics?.missing_urdu_translations || 0) > 0
              ? "⚠️ Needs Urdu Translation"
              : "✅ 100% Fully Localized"}
          </div>
        </div>
      </div>

      {/* Recent Enquiries Section */}
      <div style={{ marginTop: "32px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>
            Recent Customer Inquiries & Leads
          </h3>
          <button
            onClick={() => onNavigate("enquiries")}
            className="btn-admin btn-admin-secondary btn-admin-sm"
          >
            View All Enquiries →
          </button>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Channel</th>
                <th>Subject / Message</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(!metrics?.recent_enquiries || metrics.recent_enquiries.length === 0) ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "24px", color: "#6B7280" }}>
                    No recent inquiries.
                  </td>
                </tr>
              ) : (
                metrics.recent_enquiries.map((e) => (
                  <tr key={e.id}>
                    <td style={{ fontWeight: 600 }}>{e.name}</td>
                    <td>
                      <a
                        href={`tel:${e.phone}`}
                        style={{ color: "#E21B23", textDecoration: "none", fontWeight: 600 }}
                      >
                        {e.phone}
                      </a>
                    </td>
                    <td>
                      <span className="status-pill published">
                        {e.channel === "whatsapp" ? "💬 WhatsApp" : e.channel === "call" ? "📞 Phone" : "📝 Form"}
                      </span>
                    </td>
                    <td style={{ maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {e.message}
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "#6B7280" }}>
                      {new Date(e.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          e.status === "new"
                            ? "missing-ur"
                            : e.status === "in_progress"
                            ? "published"
                            : "complete"
                        }`}
                      >
                        {e.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
