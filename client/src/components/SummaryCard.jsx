import React from 'react';
import {
  Package, IndianRupee, Clock, Paintbrush,
  Star, Download, CheckCircle2, TrendingUp, Shield,
} from 'lucide-react';

function formatCurrency(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN');
}

export default function SummaryCard({ data, estimate }) {
  if (!data) return null;

  const {
    packageType, estimatedCost, leadScore, leadCategory,
    aiRecommendation, pdfUrl, costBreakdown, features,
    paymentMilestones, name, email,
  } = data;

  const summary = estimate?.summary;
  const materials = estimate?.materials;
  const paySchedule = estimate?.paymentSchedule || paymentMilestones;

  const scoreColor =
    leadCategory === 'High' ? '#38a169' :
    leadCategory === 'Medium' ? '#d69e2e' : '#e53e3e';

  return (
    <div style={styles.container} className="slide-up">
      {/* Success banner */}
      <div style={styles.successBanner}>
        <CheckCircle2 size={24} color="#fff" />
        <div>
          <div style={styles.successTitle}>Decorpot Quotation Ready!</div>
          <div style={styles.successSubtitle}>
            Hi {name}, your personalized interior design estimate from Decorpot is below.
          </div>
        </div>
      </div>

      {/* Cost overview */}
      <div style={styles.costSection}>
        <div style={styles.packageBadge}>{packageType} Package</div>
        <div style={styles.costAmount}>{formatCurrency(estimatedCost)}</div>
        <div style={styles.costLabel}>Total Estimated Cost (incl. GST)</div>
      </div>

      {/* Summary breakdown */}
      {summary && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Quotation Summary</h3>
          <div style={styles.breakdownList}>
            <div style={styles.breakdownItem}>
              <span style={styles.breakdownRoom}>Modular Work Total</span>
              <span style={styles.breakdownCost}>{formatCurrency(summary.modularWorkTotal)}</span>
            </div>
            <div style={styles.breakdownItem}>
              <span style={styles.breakdownRoom}>Others (Paint, Electrical, Hardware)</span>
              <span style={styles.breakdownCost}>{formatCurrency(summary.othersCost)}</span>
            </div>
            <div style={styles.breakdownItem}>
              <span style={styles.breakdownRoom}>Services</span>
              <span style={styles.breakdownCost}>{formatCurrency(summary.servicesCost)}</span>
            </div>
            <div style={{ ...styles.breakdownItem, borderTop: '1px solid #e2e8f0', paddingTop: '10px', marginTop: '4px' }}>
              <span style={styles.breakdownRoom}>Subtotal</span>
              <span style={styles.breakdownCost}>{formatCurrency(summary.subtotalBeforeDiscount)}</span>
            </div>
            <div style={{ ...styles.breakdownItem, background: '#f0fff4' }}>
              <span style={{ ...styles.breakdownRoom, color: '#38a169' }}>Discount ({summary.discountPercent}%)</span>
              <span style={{ ...styles.breakdownCost, color: '#38a169' }}>- {formatCurrency(summary.discount)}</span>
            </div>
            <div style={styles.breakdownItem}>
              <span style={styles.breakdownRoom}>GST ({summary.gstPercent}%)</span>
              <span style={styles.breakdownCost}>{formatCurrency(summary.gst)}</span>
            </div>
            <div style={{ ...styles.breakdownItem, background: '#c53030', borderRadius: '8px' }}>
              <span style={{ ...styles.breakdownRoom, color: '#fff', fontWeight: 700 }}>Total</span>
              <span style={{ ...styles.breakdownCost, color: '#fff', fontWeight: 700, fontSize: '16px' }}>{formatCurrency(summary.total)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Room-wise breakdown */}
      {costBreakdown && Object.keys(costBreakdown).length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Room-Wise Breakdown</h3>
          <div style={styles.breakdownList}>
            {Object.entries(costBreakdown).map(([room, cost]) => (
              <div key={room} style={styles.breakdownItem}>
                <span style={styles.breakdownRoom}>{room}</span>
                <span style={styles.breakdownCost}>{formatCurrency(cost)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Materials */}
      {materials && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <Shield size={16} style={{ marginRight: '6px' }} />
            Material Specification
          </h3>
          <div style={styles.materialsList}>
            {[
              ['Plywood', materials.plywood],
              ['Laminate', materials.laminate],
              ['Fittings', materials.fittings],
              ['Glass', materials.glass],
            ].map(([label, val]) => (
              <div key={label} style={styles.materialItem}>
                <span style={styles.materialLabel}>{label}</span>
                <span style={styles.materialValue}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment schedule */}
      {paySchedule && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Payment Schedule</h3>
          <div style={styles.breakdownList}>
            {Object.entries(paySchedule).map(([label, amount]) => (
              <div key={label} style={styles.breakdownItem}>
                <span style={styles.breakdownRoom}>{label}</span>
                <span style={styles.breakdownCost}>{formatCurrency(amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info grid */}
      <div style={styles.section}>
        <div style={styles.grid}>
          <div style={styles.gridItem}>
            <TrendingUp size={18} color={scoreColor} />
            <div>
              <div style={styles.gridLabel}>Lead Score</div>
              <div style={{ ...styles.gridValue, color: scoreColor }}>{leadScore}/100 ({leadCategory})</div>
            </div>
          </div>
          <div style={styles.gridItem}>
            <Star size={18} color="#d69e2e" />
            <div>
              <div style={styles.gridLabel}>Warranty</div>
              <div style={styles.gridValue}>10 Years</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendation */}
      {aiRecommendation && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <Paintbrush size={16} style={{ marginRight: '6px' }} />
            Design Recommendation
          </h3>
          <div style={styles.recommendation}>{aiRecommendation}</div>
        </div>
      )}

      {/* PDF Download */}
      {pdfUrl && (
        <a href={pdfUrl} target="_blank" rel="noopener noreferrer" style={styles.downloadBtn}>
          <Download size={18} />
          Download Decorpot Quotation PDF
        </a>
      )}

      <div style={styles.footerNote}>
        Quotation valid for 30 days. Zero cost EMI for 24 months available.
        <br />Customer Care: 9108602000
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
  },
  successBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '20px 24px',
    background: 'linear-gradient(135deg, #38a169, #2f855a)',
    color: '#fff',
  },
  successTitle: { fontWeight: 700, fontSize: '16px' },
  successSubtitle: { fontSize: '13px', opacity: 0.9, marginTop: '2px' },
  costSection: {
    textAlign: 'center',
    padding: '28px 24px 20px',
    background: 'linear-gradient(180deg, #f7fafc, #fff)',
  },
  packageBadge: {
    display: 'inline-block',
    padding: '4px 16px',
    borderRadius: '20px',
    background: '#c53030',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
  },
  costAmount: { fontSize: '34px', fontWeight: 800, color: '#1a202c', letterSpacing: '-1px' },
  costLabel: { fontSize: '12px', color: '#718096', marginTop: '4px' },
  section: { padding: '18px 24px', borderTop: '1px solid #f0f0f0' },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#c53030',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
  },
  breakdownList: { display: 'flex', flexDirection: 'column', gap: '6px' },
  breakdownItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 12px',
    borderRadius: '6px',
    background: '#f7fafc',
  },
  breakdownRoom: { fontSize: '13px', color: '#4a5568' },
  breakdownCost: { fontSize: '13px', fontWeight: 600, color: '#1a202c' },
  materialsList: { display: 'flex', flexDirection: 'column', gap: '6px' },
  materialItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 12px',
    borderRadius: '6px',
    background: '#f7fafc',
  },
  materialLabel: { fontSize: '13px', fontWeight: 600, color: '#4a5568' },
  materialValue: { fontSize: '12px', color: '#718096', textAlign: 'right', maxWidth: '60%' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
  },
  gridItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px',
    background: '#f7fafc',
    borderRadius: '10px',
  },
  gridLabel: { fontSize: '11px', color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '0.5px' },
  gridValue: { fontSize: '14px', fontWeight: 600, color: '#1a202c', marginTop: '2px' },
  recommendation: {
    padding: '14px',
    background: '#f7fafc',
    borderRadius: '10px',
    fontSize: '13px',
    lineHeight: 1.7,
    color: '#4a5568',
    whiteSpace: 'pre-wrap',
    borderLeft: '3px solid #c53030',
  },
  downloadBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    margin: '18px 24px',
    padding: '14px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #c53030, #9b2c2c)',
    color: '#fff',
    fontWeight: 600,
    fontSize: '14px',
    textDecoration: 'none',
  },
  footerNote: {
    textAlign: 'center',
    padding: '14px 24px 20px',
    fontSize: '11px',
    color: '#a0aec0',
    lineHeight: 1.6,
  },
};
