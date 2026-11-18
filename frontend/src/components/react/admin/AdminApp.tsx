import React, { useEffect, useState } from "react";
import { AdminLogin } from "./AdminLogin";
import { AdminAcceptInvite } from "./AdminAcceptInvite";
import { DashboardView } from "./DashboardView";
import { ProductsView } from "./ProductsView";
import { CategoriesView } from "./CategoriesView";
import { BrandsView } from "./BrandsView";
import { EnquiriesView } from "./EnquiriesView";
import { InvitationsView } from "./InvitationsView";
import { apiGetMe, clearTokens, getStoredToken } from "./api";
import type { AdminUser } from "./types";

export const AdminApp: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [initialProductFilter, setInitialProductFilter] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Check URL parameters for invitation token or tabs
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("invite");
      if (token) {
        setInviteToken(token);
        setLoading(false);
        return;
      }

      const tabParam = urlParams.get("tab");
      if (tabParam) {
        setCurrentTab(tabParam);
      }
    }

    // Check stored authentication
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }

    apiGetMe()
      .then((user) => {
        setCurrentUser(user);
      })
      .catch(() => {
        clearTokens();
        setCurrentUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    clearTokens();
    setCurrentUser(null);
    if (typeof window !== "undefined") {
      window.location.href = "/admin/";
    }
  };

  const handleNavigate = (tab: string, filter?: string) => {
    setCurrentTab(tab);
    setInitialProductFilter(filter);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      if (filter) {
        url.searchParams.set("filter", filter);
      } else {
        url.searchParams.delete("filter");
      }
      window.history.pushState({}, "", url.toString());
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#111111", color: "#FFFFFF" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "8px" }}>
            Naseer <span style={{ color: "#E21B23" }}>Hardware</span>
          </div>
          <div style={{ fontSize: "0.875rem", color: "#9CA3AF" }}>Loading Admin Workspace...</div>
        </div>
      </div>
    );
  }

  // Invitation acceptance view
  if (inviteToken) {
    return (
      <AdminAcceptInvite
        token={inviteToken}
        onSuccess={() => {
          setInviteToken(null);
          if (typeof window !== "undefined") {
            window.location.href = "/admin/";
          }
        }}
      />
    );
  }

  // Unauthenticated login view
  if (!currentUser) {
    return <AdminLogin onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <a href="/admin/" className="admin-sidebar-logo">
            NASEER <span>HARDWARE</span>
          </a>
          <div className="admin-sidebar-sub">Admin Console</div>
        </div>

        <nav className="admin-nav">
          <button
            onClick={() => handleNavigate("dashboard")}
            className={`admin-nav-item ${currentTab === "dashboard" ? "active" : ""}`}
          >
            <span>📊</span>
            <span>Dashboard Overview</span>
          </button>

          <button
            onClick={() => handleNavigate("products")}
            className={`admin-nav-item ${currentTab === "products" ? "active" : ""}`}
          >
            <span>📦</span>
            <span>Products Catalogue</span>
          </button>

          <button
            onClick={() => handleNavigate("categories")}
            className={`admin-nav-item ${currentTab === "categories" ? "active" : ""}`}
          >
            <span>🗂️</span>
            <span>Categories</span>
          </button>

          <button
            onClick={() => handleNavigate("brands")}
            className={`admin-nav-item ${currentTab === "brands" ? "active" : ""}`}
          >
            <span>🏷️</span>
            <span>Brands</span>
          </button>

          {currentUser.role !== "catalogue_editor" && (
            <button
              onClick={() => handleNavigate("enquiries")}
              className={`admin-nav-item ${currentTab === "enquiries" ? "active" : ""}`}
            >
              <span>📥</span>
              <span>Enquiries Inbox</span>
            </button>
          )}

          {currentUser.role === "super_admin" && (
            <button
              onClick={() => handleNavigate("invitations")}
              className={`admin-nav-item ${currentTab === "invitations" ? "active" : ""}`}
            >
              <span>👥</span>
              <span>Team & Invitations</span>
            </button>
          )}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-user-name">{currentUser.full_name}</div>
            <div className="admin-user-role">
              {currentUser.role.replace("_", " ")}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn-admin btn-admin-secondary btn-admin-sm"
            style={{ width: "100%", marginTop: "12px", background: "#1F2937", color: "#D1D5DB", borderColor: "#374151" }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="admin-main">
        {/* Top Header */}
        <header className="admin-topbar">
          <h2 className="admin-topbar-title">
            {currentTab === "dashboard" && "Dashboard Overview"}
            {currentTab === "products" && "Catalogue Products"}
            {currentTab === "categories" && "Categories Hierarchy"}
            {currentTab === "brands" && "Brands & Manufacturers"}
            {currentTab === "enquiries" && "Customer Leads & Inquiries"}
            {currentTab === "invitations" && "Staff Invitations"}
          </h2>

          <div className="admin-topbar-actions">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="btn-admin btn-admin-secondary btn-admin-sm"
            >
              🌐 View Public Website ↗
            </a>
          </div>
        </header>

        {/* Content View Container */}
        <div className="admin-content">
          {currentTab === "dashboard" && <DashboardView onNavigate={handleNavigate} />}
          {currentTab === "products" && <ProductsView initialFilter={initialProductFilter} />}
          {currentTab === "categories" && <CategoriesView />}
          {currentTab === "brands" && <BrandsView />}
          {currentTab === "enquiries" && <EnquiriesView />}
          {currentTab === "invitations" && <InvitationsView currentUser={currentUser} />}
        </div>
      </main>
    </div>
  );
};
