import React, { useEffect, useState } from "react";
import {
  FiZap,
  FiRefreshCw,
  FiCheckCircle,
  FiClock,
  FiPackage,
  FiFolder,
  FiTag,
  FiInbox,
  FiGlobe,
  FiArrowRight,
  FiPhone,
  FiFileText,
  FiAlertCircle,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
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
    const pollInterval = buildStatus?.status === "building" ? 3000 : 15000;
    const interval = setInterval(loadData, pollInterval);
    return () => clearInterval(interval);
  }, [buildStatus?.status]);

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
          <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#6B7280", display: "flex", alignItems: "center", gap: "6px" }}>
            <span>Production SSG Status:</span>
            <strong style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              {buildStatus?.status === "building" ? (
                <>
                  <FiRefreshCw className="spin-icon" style={{ color: "#E21B23" }} />
                  <span>Generating Static Site...</span>
                </>
              ) : buildStatus?.status === "success" ? (
                <>
                  <FiCheckCircle style={{ color: "#059669" }} />
                  <span>Live & Synchronized</span>
                </>
              ) : (
                <>
                  <FiClock style={{ color: "#9CA3AF" }} />
                  <span>Idle</span>
                </>
              )}
            </strong>
            {buildStatus?.last_built_at && (
              <span>
                (Last updated {new Date(buildStatus.last_built_at).toLocaleTimeString()})
              </span>
            )}
          </p>
        </div>

        <button
          onClick={handleTriggerBuild}
          disabled={triggeringBuild || buildStatus?.status === "building"}
          className="btn-admin btn-admin-primary"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          {triggeringBuild || buildStatus?.status === "building" ? (
            <>
              <FiRefreshCw className="spin-icon" />
              <span>Rebuilding Static Pages...</span>
            </>
          ) : (
            <>
              <FiZap />
              <span>Trigger Site Rebuild</span>
            </>
          )}
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="admin-kpi-grid">
        <div
          className="admin-kpi-card"
          onClick={() => onNavigate("products")}
          style={{ cursor: "pointer" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="admin-kpi-label">Catalogue Products</div>
            <FiPackage style={{ color: "#E21B23", fontSize: "1.25rem" }} />
          </div>
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="admin-kpi-label">Active Categories</div>
            <FiFolder style={{ color: "#2563EB", fontSize: "1.25rem" }} />
          </div>
          <div className="admin-kpi-value">{metrics?.total_categories || 0}</div>
          <div className="admin-kpi-badge success">Hardware, Plywood, Kitchen, Bathroom</div>
        </div>

        <div
          className="admin-kpi-card"
          onClick={() => onNavigate("brands")}
          style={{ cursor: "pointer" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="admin-kpi-label">Partner Brands</div>
            <FiTag style={{ color: "#7C3AED", fontSize: "1.25rem" }} />
          </div>
          <div className="admin-kpi-value">{metrics?.total_brands || 0}</div>
          <div className="admin-kpi-badge success">All Verified Brands</div>
        </div>

        <div
          className="admin-kpi-card"
          onClick={() => onNavigate("enquiries")}
          style={{ cursor: "pointer" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="admin-kpi-label">Customer Leads & Enquiries</div>
            <FiInbox style={{ color: "#D97706", fontSize: "1.25rem" }} />
          </div>
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="admin-kpi-label">Urdu Localization Health</div>
            <FiGlobe
              style={{
                color: (metrics?.missing_urdu_translations || 0) > 0 ? "#D97706" : "#059669",
                fontSize: "1.25rem",
              }}
            />
          </div>
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
            style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
          >
            {(metrics?.missing_urdu_translations || 0) > 0 ? (
              <>
                <FiAlertCircle />
                <span>Needs Urdu Translation</span>
              </>
            ) : (
              <>
                <FiCheckCircle />
                <span>100% Fully Localized</span>
              </>
            )}
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
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <span>View All Enquiries</span>
            <FiArrowRight />
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
                      <span className="status-pill published" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        {e.channel === "whatsapp" ? (
                          <>
                            <FaWhatsapp style={{ color: "#25D366" }} />
                            <span>WhatsApp</span>
                          </>
                        ) : e.channel === "call" ? (
                          <>
                            <FiPhone style={{ color: "#3B82F6" }} />
                            <span>Phone</span>
                          </>
                        ) : (
                          <>
                            <FiFileText style={{ color: "#6B7280" }} />
                            <span>Form</span>
                          </>
                        )}
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
