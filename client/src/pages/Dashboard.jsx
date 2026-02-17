import React, { useState, useEffect } from 'react';
import {
  Users, TrendingUp, IndianRupee, BarChart3,
  RefreshCw, ChevronLeft, ChevronRight,
  ArrowLeft, Eye, Filter,
} from 'lucide-react';
import { getAllLeads } from '../services/api';

function formatCurrency(amount) {
  if (!amount) return '₹0';
  if (amount >= 100000) return '₹' + (amount / 100000).toFixed(1) + 'L';
  return '₹' + Number(amount).toLocaleString('en-IN');
}

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [filter, setFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);

  const fetchLeads = async (page = 1, category = '') => {
    setIsLoading(true);
    try {
      const params = { page, limit: 15 };
      if (category) params.category = category;
      const data = await getAllLeads(params);
      setLeads(data.leads || []);
      setPagination(data.pagination || { total: 0, page: 1, pages: 1 });
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(1, filter);
  }, [filter]);

  const stats = {
    total: pagination.total,
    high: leads.filter((l) => l.leadCategory === 'High').length,
    totalValue: leads.reduce((s, l) => s + (l.estimatedCost || 0), 0),
    avgScore: leads.length
      ? Math.round(leads.reduce((s, l) => s + (l.leadScore || 0), 0) / leads.length)
      : 0,
  };

  return (
    <div style={styles.page}>
      <nav style={styles.nav}>
        <div style={styles.navLeft}>
          <a href="/" style={styles.backBtn}>
            <ArrowLeft size={18} />
          </a>
          <span style={styles.logo}>Decorpot</span>
          <span style={styles.badge}>Admin</span>
        </div>
        <button
          style={styles.refreshBtn}
          onClick={() => fetchLeads(pagination.page, filter)}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </nav>

      <div style={styles.content}>
        <h1 style={styles.title}>Lead Dashboard</h1>

        {/* Stats */}
        <div style={styles.statsGrid}>
          {[
            { icon: <Users size={22} />, label: 'Total Leads', value: stats.total, color: '#3182ce' },
            { icon: <TrendingUp size={22} />, label: 'High Quality', value: stats.high, color: '#38a169' },
            { icon: <IndianRupee size={22} />, label: 'Pipeline Value', value: formatCurrency(stats.totalValue), color: '#d69e2e' },
            { icon: <BarChart3 size={22} />, label: 'Avg Score', value: `${stats.avgScore}/100`, color: '#e53e3e' },
          ].map((stat, i) => (
            <div key={i} style={styles.statCard}>
              <div style={{ ...styles.statIcon, background: `${stat.color}15`, color: stat.color }}>
                {stat.icon}
              </div>
              <div>
                <div style={styles.statValue}>{stat.value}</div>
                <div style={styles.statLabel}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={styles.filterBar}>
          <div style={styles.filterGroup}>
            <Filter size={16} color="#718096" />
            {['', 'High', 'Medium', 'Low'].map((cat) => (
              <button
                key={cat || 'all'}
                onClick={() => setFilter(cat)}
                style={{
                  ...styles.filterBtn,
                  background: filter === cat ? '#1a365d' : '#f7fafc',
                  color: filter === cat ? '#fff' : '#4a5568',
                }}
              >
                {cat || 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={styles.tableWrap}>
          {isLoading ? (
            <div style={styles.loading}>Loading leads...</div>
          ) : leads.length === 0 ? (
            <div style={styles.empty}>
              <p style={{ fontSize: '16px', fontWeight: 600, color: '#4a5568' }}>No leads found</p>
              <p style={{ fontSize: '13px', color: '#a0aec0', marginTop: '4px' }}>
                Leads will appear here once clients complete the consultation.
              </p>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Name', 'Property', 'City', 'Package', 'Est. Cost', 'Score', 'Category', 'Date', ''].map(
                    (h) => (
                      <th key={h} style={styles.th}>
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead._id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.nameCell}>
                        <div style={styles.nameText}>{lead.name}</div>
                        <div style={styles.emailText}>{lead.email}</div>
                      </div>
                    </td>
                    <td style={styles.td}>{lead.propertyType}</td>
                    <td style={styles.td}>{lead.city}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.pkgBadge,
                          background:
                            lead.packageType === 'Luxury'
                              ? '#faf5ff'
                              : lead.packageType === 'Premium'
                              ? '#ebf8ff'
                              : '#f0fff4',
                          color:
                            lead.packageType === 'Luxury'
                              ? '#805ad5'
                              : lead.packageType === 'Premium'
                              ? '#2b6cb0'
                              : '#2f855a',
                        }}
                      >
                        {lead.packageType}
                      </span>
                    </td>
                    <td style={{ ...styles.td, fontWeight: 600 }}>
                      {formatCurrency(lead.estimatedCost)}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.scoreBar}>
                        <div
                          style={{
                            ...styles.scoreFill,
                            width: `${lead.leadScore}%`,
                            background:
                              lead.leadScore >= 70
                                ? '#38a169'
                                : lead.leadScore >= 40
                                ? '#d69e2e'
                                : '#e53e3e',
                          }}
                        />
                      </div>
                      <span style={styles.scoreNum}>{lead.leadScore}</span>
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.catBadge,
                          background:
                            lead.leadCategory === 'High'
                              ? '#f0fff4'
                              : lead.leadCategory === 'Medium'
                              ? '#fffff0'
                              : '#fff5f5',
                          color:
                            lead.leadCategory === 'High'
                              ? '#38a169'
                              : lead.leadCategory === 'Medium'
                              ? '#d69e2e'
                              : '#e53e3e',
                        }}
                      >
                        {lead.leadCategory}
                      </span>
                    </td>
                    <td style={{ ...styles.td, fontSize: '12px', color: '#a0aec0' }}>
                      {new Date(lead.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td style={styles.td}>
                      <button
                        style={styles.viewBtn}
                        onClick={() => setSelectedLead(selectedLead?._id === lead._id ? null : lead)}
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={styles.pagination}>
            <button
              style={styles.pageBtn}
              disabled={pagination.page <= 1}
              onClick={() => fetchLeads(pagination.page - 1, filter)}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={styles.pageInfo}>
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              style={styles.pageBtn}
              disabled={pagination.page >= pagination.pages}
              onClick={() => fetchLeads(pagination.page + 1, filter)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Lead detail panel */}
        {selectedLead && (
          <div style={styles.detailPanel} className="fade-in">
            <h3 style={styles.detailTitle}>Lead Details — {selectedLead.name}</h3>
            <div style={styles.detailGrid}>
              {[
                ['Phone', selectedLead.phone],
                ['Email', selectedLead.email],
                ['Property', selectedLead.propertyType],
                ['Area', `${selectedLead.carpetArea} sqft`],
                ['City', selectedLead.city],
                ['Budget', formatCurrency(selectedLead.budget)],
                ['Timeline', selectedLead.timeline],
                ['Rooms', (selectedLead.rooms || []).join(', ')],
                ['Style', selectedLead.style],
                ['Package', selectedLead.packageType],
                ['Estimated Cost', formatCurrency(selectedLead.estimatedCost)],
                ['Lead Score', `${selectedLead.leadScore}/100 (${selectedLead.leadCategory})`],
              ].map(([label, value]) => (
                <div key={label} style={styles.detailItem}>
                  <span style={styles.detailLabel}>{label}</span>
                  <span style={styles.detailValue}>{value || 'N/A'}</span>
                </div>
              ))}
            </div>
            {selectedLead.aiRecommendation && (
              <div style={styles.detailRec}>
                <strong>AI Recommendation:</strong>
                <p style={{ marginTop: '6px', whiteSpace: 'pre-wrap' }}>
                  {selectedLead.aiRecommendation}
                </p>
              </div>
            )}
            {selectedLead.pdfUrl && (
              <a
                href={selectedLead.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.detailPdfBtn}
              >
                Download PDF
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f7fafc',
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 32px',
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  navLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    background: '#f7fafc',
    color: '#4a5568',
    textDecoration: 'none',
  },
  logo: {
    fontWeight: 800,
    fontSize: '20px',
    color: '#c53030',
  },
  badge: {
    padding: '2px 10px',
    borderRadius: '6px',
    background: '#ebf4ff',
    color: '#2b6cb0',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: '#fff',
    fontSize: '13px',
    fontWeight: 500,
    color: '#4a5568',
    cursor: 'pointer',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px 24px',
  },
  title: {
    fontSize: '26px',
    fontWeight: 800,
    color: '#1a202c',
    marginBottom: '24px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '28px',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    background: '#fff',
    borderRadius: '14px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    border: '1px solid #edf2f7',
  },
  statIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: '20px',
    fontWeight: 800,
    color: '#1a202c',
  },
  statLabel: {
    fontSize: '12px',
    color: '#a0aec0',
    marginTop: '1px',
  },
  filterBar: {
    marginBottom: '16px',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  filterBtn: {
    padding: '6px 16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tableWrap: {
    background: '#fff',
    borderRadius: '14px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    border: '1px solid #edf2f7',
    overflow: 'auto',
  },
  loading: {
    padding: '60px',
    textAlign: 'center',
    color: '#a0aec0',
    fontSize: '14px',
  },
  empty: {
    padding: '60px',
    textAlign: 'center',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: 700,
    color: '#a0aec0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid #edf2f7',
    background: '#fafbfc',
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: '1px solid #f7fafc',
    transition: 'background 0.15s',
  },
  td: {
    padding: '12px 16px',
    fontSize: '13px',
    color: '#4a5568',
    whiteSpace: 'nowrap',
  },
  nameCell: {},
  nameText: {
    fontWeight: 600,
    color: '#1a202c',
  },
  emailText: {
    fontSize: '11px',
    color: '#a0aec0',
    marginTop: '1px',
  },
  pkgBadge: {
    padding: '3px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
  },
  scoreBar: {
    width: '50px',
    height: '5px',
    borderRadius: '3px',
    background: '#edf2f7',
    display: 'inline-block',
    marginRight: '8px',
    verticalAlign: 'middle',
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.5s',
  },
  scoreNum: {
    fontSize: '12px',
    fontWeight: 600,
    verticalAlign: 'middle',
  },
  catBadge: {
    padding: '3px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
  },
  viewBtn: {
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#718096',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '12px',
    marginTop: '20px',
  },
  pageBtn: {
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#4a5568',
  },
  pageInfo: {
    fontSize: '13px',
    color: '#718096',
  },
  detailPanel: {
    marginTop: '24px',
    padding: '24px',
    background: '#fff',
    borderRadius: '14px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    border: '1px solid #edf2f7',
  },
  detailTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#1a365d',
    marginBottom: '16px',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '12px',
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  detailLabel: {
    fontSize: '11px',
    color: '#a0aec0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  detailValue: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1a202c',
  },
  detailRec: {
    marginTop: '16px',
    padding: '16px',
    background: '#f7fafc',
    borderRadius: '10px',
    fontSize: '13px',
    lineHeight: 1.7,
    color: '#4a5568',
    borderLeft: '3px solid #1a365d',
  },
  detailPdfBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '14px',
    padding: '10px 20px',
    borderRadius: '8px',
    background: '#e53e3e',
    color: '#fff',
    fontSize: '13px',
    fontWeight: 600,
    textDecoration: 'none',
  },
};
