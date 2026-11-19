import React, { useEffect, useState } from "react";
import {
  FiSearch,
  FiPhone,
  FiFileText,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
  FiTrash2,
  FiX,
  FiInbox,
  FiPhoneCall,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { apiListEnquiries, apiUpdateEnquiryStatus, apiDeleteEnquiry } from "./api";
import type { AdminEnquiry } from "./types";

export const EnquiriesView: React.FC = () => {
  const [enquiries, setEnquiries] = useState<AdminEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [channelFilter, setChannelFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selected enquiry for detail drawer
  const [selectedEnquiry, setSelectedEnquiry] = useState<AdminEnquiry | null>(null);

  const loadEnquiries = async () => {
    setLoading(true);
    try {
      const data = await apiListEnquiries({
        page,
        status: statusFilter || undefined,
        channel: channelFilter || undefined,
        q: search || undefined,
      });
      setEnquiries(data.items);
      setTotalPages(data.total_pages);
      setTotalCount(data.total);
    } catch (err) {
      console.error("Failed to load enquiries", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, [page, statusFilter, channelFilter, search]);

  const handleStatusChange = async (enquiryId: string, newStatus: string) => {
    try {
      const updated = await apiUpdateEnquiryStatus(enquiryId, newStatus);
      setEnquiries((prev) => prev.map((e) => (e.id === enquiryId ? updated : e)));
      if (selectedEnquiry && selectedEnquiry.id === enquiryId) {
        setSelectedEnquiry(updated);
      }
    } catch (err: any) {
      alert("Failed to update enquiry status: " + err.message);
    }
  };

  const handleDelete = async (enquiryId: string) => {
    if (!confirm("Are you sure you want to delete this enquiry record?")) return;
    try {
      await apiDeleteEnquiry(enquiryId);
      setSelectedEnquiry(null);
      loadEnquiries();
    } catch (err: any) {
      alert("Failed to delete enquiry: " + err.message);
    }
  };

  return (
    <div>
      <div className="admin-action-bar">
        <div className="admin-filters">
          <div style={{ position: "relative", minWidth: "260px" }}>
            <FiSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
            <input
              type="text"
              className="admin-search-input"
              style={{ paddingLeft: "36px", width: "100%" }}
              placeholder="Search by customer name, phone, message..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <select
            className="admin-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="new">🟡 New</option>
            <option value="in_progress">🔵 In Progress</option>
            <option value="resolved">🟢 Resolved</option>
            <option value="spam">⛔ Spam</option>
          </select>

          <select
            className="admin-select"
            value={channelFilter}
            onChange={(e) => {
              setChannelFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Channels</option>
            <option value="whatsapp">💬 WhatsApp</option>
            <option value="call">📞 Phone Call</option>
            <option value="form">📝 Contact Form</option>
          </select>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Channel</th>
              <th>Product / Subject</th>
              <th>Message Preview</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: "30px", color: "#6B7280" }}>
                  Loading enquiries...
                </td>
              </tr>
            ) : enquiries.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: "30px", color: "#6B7280" }}>
                  No customer enquiries match this filter.
                </td>
              </tr>
            ) : (
              enquiries.map((e) => (
                <tr key={e.id}>
                  <td style={{ fontSize: "0.8rem", color: "#6B7280", whiteSpace: "nowrap" }}>
                    {new Date(e.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ fontWeight: 600 }}>{e.name}</td>
                  <td>
                    <a
                      href={`tel:${e.phone}`}
                      style={{ color: "#E21B23", textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}
                    >
                      <FiPhone />
                      <span>{e.phone}</span>
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
                          <span>Call</span>
                        </>
                      ) : (
                        <>
                          <FiFileText style={{ color: "#6B7280" }} />
                          <span>Form</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td>{e.product_name_en || <span style={{ color: "#9CA3AF" }}>General Enquiry</span>}</td>
                  <td style={{ maxWidth: "240px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {e.message}
                  </td>
                  <td>
                    <select
                      className="admin-select"
                      style={{
                        padding: "3px 8px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        backgroundColor:
                          e.status === "new"
                            ? "#FEF08A"
                            : e.status === "in_progress"
                            ? "#E1EFFE"
                            : e.status === "resolved"
                            ? "#DEF7EC"
                            : "#F3F4F6",
                      }}
                      value={e.status}
                      onChange={(evt) => handleStatusChange(e.id, evt.target.value)}
                    >
                      <option value="new">NEW</option>
                      <option value="in_progress">IN PROGRESS</option>
                      <option value="resolved">RESOLVED</option>
                      <option value="spam">SPAM</option>
                    </select>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      onClick={() => setSelectedEnquiry(e)}
                      className="btn-admin btn-admin-secondary btn-admin-sm"
                      style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                    >
                      <FiEye />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "16px",
          fontSize: "0.875rem",
          color: "#6B7280",
        }}
      >
        <div>
          Showing {enquiries.length} of {totalCount} total inquiries
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="btn-admin btn-admin-secondary btn-admin-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
          >
            <FiChevronLeft />
            <span>Previous</span>
          </button>
          <span style={{ padding: "4px 8px", fontWeight: 600 }}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="btn-admin btn-admin-secondary btn-admin-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
          >
            <span>Next</span>
            <FiChevronRight />
          </button>
        </div>
      </div>

      {/* Details Modal */}
      {selectedEnquiry && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: "560px" }}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <FiInbox style={{ color: "#E21B23" }} />
                <span>Customer Inquiry Details</span>
              </h3>
              <button
                onClick={() => setSelectedEnquiry(null)}
                style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", display: "inline-flex", alignItems: "center" }}
                title="Close modal"
              >
                <FiX />
              </button>
            </div>

            <div className="admin-modal-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <div className="form-label">Customer Name</div>
                  <div style={{ fontWeight: 600, fontSize: "1rem" }}>{selectedEnquiry.name}</div>
                </div>
                <div>
                  <div className="form-label">Phone Number</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <a
                      href={`tel:${selectedEnquiry.phone}`}
                      style={{ color: "#E21B23", fontWeight: 700, fontSize: "1rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}
                    >
                      <FiPhoneCall />
                      <span>{selectedEnquiry.phone}</span>
                    </a>
                    <a
                      href={`https://wa.me/92${selectedEnquiry.phone.replace(/\D/g, '').replace(/^0/, '')}?text=${encodeURIComponent('Hi, regarding your enquiry on Naseer Hardware...')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-admin btn-admin-secondary btn-admin-sm"
                      style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#25D366", borderColor: "#25D366", marginTop: "4px", width: "fit-content" }}
                    >
                      <FaWhatsapp style={{ color: "#25D366" }} />
                      <span>WhatsApp Customer</span>
                    </a>
                  </div>
                </div>
              </div>

              {selectedEnquiry.email && (
                <div style={{ marginBottom: "16px" }}>
                  <div className="form-label">Email</div>
                  <div>{selectedEnquiry.email}</div>
                </div>
              )}

              {selectedEnquiry.product_name_en && (
                <div style={{ marginBottom: "16px", padding: "10px", background: "#F9FAFB", borderRadius: "6px" }}>
                  <div className="form-label">Referenced Product</div>
                  <div style={{ fontWeight: 600 }}>{selectedEnquiry.product_name_en}</div>
                  <div style={{ fontSize: "0.8rem", color: "#6B7280" }}>Slug: {selectedEnquiry.product_slug}</div>
                </div>
              )}

              <div style={{ marginBottom: "16px" }}>
                <div className="form-label">Message / Requirement</div>
                <div
                  style={{
                    padding: "12px",
                    background: "#F9FAFB",
                    borderRadius: "6px",
                    border: "1px solid #E5E7EB",
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.5,
                  }}
                >
                  {selectedEnquiry.message}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "0.8rem", color: "#6B7280" }}>
                <div>
                  <strong>Inquiry Channel:</strong> {selectedEnquiry.channel.toUpperCase()}
                </div>
                <div>
                  <strong>Language Locale:</strong> {selectedEnquiry.locale.toUpperCase()}
                </div>
                <div>
                  <strong>Client IP:</strong> {selectedEnquiry.ip_address || "—"}
                </div>
                <div>
                  <strong>Received:</strong> {new Date(selectedEnquiry.created_at).toLocaleString()}
                </div>
              </div>

              <div style={{ marginTop: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
                <div className="form-label" style={{ margin: 0 }}>
                  Update Lead Status:
                </div>
                <select
                  className="admin-select"
                  value={selectedEnquiry.status}
                  onChange={(e) => handleStatusChange(selectedEnquiry.id, e.target.value)}
                >
                  <option value="new">NEW (Unreviewed)</option>
                  <option value="in_progress">IN PROGRESS (Contacted)</option>
                  <option value="resolved">RESOLVED (Order Closed)</option>
                  <option value="spam">SPAM / IGNORE</option>
                </select>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                onClick={() => handleDelete(selectedEnquiry.id)}
                className="btn-admin btn-admin-danger"
                style={{ marginRight: "auto", display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <FiTrash2 />
                <span>Delete Record</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="btn-admin btn-admin-secondary"
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <FiX />
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
