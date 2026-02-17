import React, { useState, useCallback } from 'react';
import {
  Sparkles, ArrowRight, Shield, Clock, Award,
  CheckCircle2, Home as HomeIcon, Palette, Calculator, Upload,
} from 'lucide-react';
import ChatInterface from '../components/ChatInterface';
import LeadForm from '../components/LeadForm';
import SummaryCard from '../components/SummaryCard';
import FloorPlanUpload from '../components/FloorPlanUpload';
import { createLead, getEstimate } from '../services/api';
import { getDesignRecommendation } from '../services/puterAI';

const STEPS = {
  LANDING: 'landing',
  FLOOR_PLAN: 'floor_plan',
  CHAT: 'chat',
  LEAD_FORM: 'lead_form',
  SUMMARY: 'summary',
};

export default function Home() {
  const [step, setStep] = useState(STEPS.LANDING);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  const [collectedData, setCollectedData] = useState(null);
  const [floorPlanData, setFloorPlanData] = useState(null);
  const [estimate, setEstimate] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartWithPlan = () => setStep(STEPS.FLOOR_PLAN);
  const handleStartChat = () => setStep(STEPS.CHAT);

  const handleFloorPlanAnalyzed = (data) => {
    setFloorPlanData(data);
  };

  const handleContinueToChat = () => {
    setStep(STEPS.CHAT);
  };

  const handleDataCollected = useCallback(async (data) => {
    setCollectedData(data);
    try {
      const est = await getEstimate(data.carpetArea, data.budget, data.rooms);
      setEstimate(est);
    } catch (err) {
      console.error('Estimate fetch failed:', err);
    }
    setStep(STEPS.LEAD_FORM);
  }, []);

  const handleLeadSubmit = useCallback(async (contactInfo) => {
    setIsSubmitting(true);
    try {
      let aiRecommendation = '';
      try {
        aiRecommendation = await getDesignRecommendation({
          ...collectedData,
          packageType: estimate?.packageType,
          estimatedCost: estimate?.estimatedCost,
        });
      } catch (aiErr) {
        console.error('AI recommendation skipped:', aiErr);
        aiRecommendation = 'Our Decorpot design team will provide personalized suggestions shortly.';
      }

      const leadPayload = {
        ...contactInfo,
        ...collectedData,
        aiRecommendation,
      };
      const result = await createLead(leadPayload);
      setSummaryData({
        ...result.lead,
        name: contactInfo.name,
        email: contactInfo.email,
        aiRecommendation: result.lead.aiRecommendation || aiRecommendation,
      });
      setStep(STEPS.SUMMARY);
    } catch (err) {
      console.error('Lead creation failed:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [collectedData, estimate]);

  // FLOOR PLAN STEP
  if (step === STEPS.FLOOR_PLAN) {
    return (
      <div style={styles.page}>
        <nav style={styles.nav}>
          <span style={styles.logo}>Decorpot</span>
          <StepIndicator current={0} />
        </nav>
        <div style={styles.floorPlanWrapper}>
          <FloorPlanUpload onAnalysisComplete={handleFloorPlanAnalyzed} />
          <div style={styles.floorPlanActions}>
            <button style={styles.secondaryBtn} onClick={handleContinueToChat}>
              {floorPlanData ? 'Continue to Chat' : 'Skip — Enter Details Manually'}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // CHAT STEP
  if (step === STEPS.CHAT) {
    return (
      <div style={styles.page}>
        <nav style={styles.nav}>
          <span style={styles.logo}>Decorpot</span>
          <StepIndicator current={1} />
        </nav>
        <div style={styles.chatWrapper}>
          {floorPlanData && (
            <div style={styles.floorPlanBanner}>
              <CheckCircle2 size={16} color="#38a169" />
              <span>Floor plan analyzed: <strong>{floorPlanData.propertyType}</strong>, ~{floorPlanData.estimatedCarpetArea} sqft, {(floorPlanData.roomsIdentified || []).length} rooms detected</span>
            </div>
          )}
          <ChatInterface
            sessionId={sessionId}
            onDataCollected={handleDataCollected}
            floorPlanData={floorPlanData}
          />
        </div>
      </div>
    );
  }

  // LEAD FORM STEP
  if (step === STEPS.LEAD_FORM) {
    return (
      <div style={styles.page}>
        <nav style={styles.nav}>
          <span style={styles.logo}>Decorpot</span>
          <StepIndicator current={2} />
        </nav>
        <div style={styles.formWrapper}>
          {estimate && (
            <div style={styles.previewCard}>
              <div style={styles.previewLabel}>Decorpot Estimated Package</div>
              <div style={styles.previewPkg}>{estimate.packageType}</div>
              <div style={styles.previewCost}>
                ₹{Number(estimate.estimatedCost).toLocaleString('en-IN')}
              </div>
              <div style={styles.previewInc}>Inclusive of 18% GST | 5% Discount Applied</div>
            </div>
          )}
          <LeadForm onSubmit={handleLeadSubmit} isLoading={isSubmitting} />
        </div>
      </div>
    );
  }

  // SUMMARY STEP
  if (step === STEPS.SUMMARY) {
    return (
      <div style={styles.page}>
        <nav style={styles.nav}>
          <span style={styles.logo}>Decorpot</span>
          <StepIndicator current={3} />
        </nav>
        <div style={styles.summaryWrapper}>
          <SummaryCard data={summaryData} estimate={estimate} />
        </div>
      </div>
    );
  }

  // LANDING PAGE
  return (
    <div style={styles.landing}>
      <nav style={styles.nav}>
        <span style={styles.logo}>Decorpot</span>
        <a href="/dashboard" style={styles.navLink}>Admin Dashboard</a>
      </nav>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>
            <Sparkles size={14} />
            AI-Powered Design Consultation
          </div>
          <h1 style={styles.heroTitle}>
            Your Dream Home,<br />
            <span style={styles.heroAccent}>Designed by Decorpot</span>
          </h1>
          <p style={styles.heroSubtitle}>
            Upload your floor plan and get an instant, accurate interior design estimate.
            Powered by AI with Decorpot's real pricing — Hettich fittings,
            premium laminates, and 10-year warranty on all woodwork.
          </p>
          <div style={styles.ctaGroup}>
            <button style={styles.ctaBtn} onClick={handleStartWithPlan}>
              <Upload size={18} />
              Upload Floor Plan
            </button>
            <button style={styles.ctaBtnOutline} onClick={handleStartChat}>
              Chat with Consultant
              <ArrowRight size={18} />
            </button>
          </div>
          <div style={styles.heroStats}>
            <div style={styles.stat}>
              <div style={styles.statNum}>2,000+</div>
              <div style={styles.statLabel}>Homes Delivered</div>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.stat}>
              <div style={styles.statNum}>10 Yr</div>
              <div style={styles.statLabel}>Warranty</div>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.stat}>
              <div style={styles.statNum}>45 Days</div>
              <div style={styles.statLabel}>Avg. Delivery</div>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.stat}>
              <div style={styles.statNum}>0% EMI</div>
              <div style={styles.statLabel}>Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={styles.howSection}>
        <h2 style={styles.sectionTitle}>How It Works</h2>
        <div style={styles.stepsGrid}>
          {[
            { icon: <Upload size={28} />, title: 'Upload Floor Plan', desc: 'Upload your floor plan image. Our AI analyzes rooms, dimensions, and layout automatically.' },
            { icon: <Palette size={28} />, title: 'Share Your Vision', desc: 'Chat with our AI consultant about your style, budget, and preferences — or let the floor plan do the talking.' },
            { icon: <Calculator size={28} />, title: 'Get Decorpot Estimate', desc: 'Receive accurate pricing with real Decorpot rates — room-wise breakdown, material specs, and payment schedule.' },
          ].map((item, i) => (
            <div key={i} style={styles.stepCard}>
              <div style={styles.stepNum}>{i + 1}</div>
              <div style={styles.stepIcon}>{item.icon}</div>
              <h3 style={styles.stepTitle}>{item.title}</h3>
              <p style={styles.stepDesc}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Materials */}
      <section style={styles.materialsSection}>
        <h2 style={{ ...styles.sectionTitle, color: '#fff' }}>Premium Materials We Use</h2>
        <div style={styles.materialsGrid}>
          {[
            { brand: 'Hettich', desc: 'German-engineered fittings & channels' },
            { brand: 'Airolam / Stylam', desc: '1mm premium decorative laminates' },
            { brand: 'Green Ply', desc: 'BWP Grade 710 for wet areas' },
            { brand: 'Saint Gobain', desc: 'Tinted, fluted & frosted glass' },
          ].map((mat, i) => (
            <div key={i} style={styles.materialCard}>
              <div style={styles.materialBrand}>{mat.brand}</div>
              <div style={styles.materialDesc}>{mat.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust signals */}
      <section style={styles.trustSection}>
        <div style={styles.trustGrid}>
          {[
            { icon: <Shield size={22} />, text: '10-Year Warranty on All Woodwork' },
            { icon: <Clock size={22} />, text: '45-Day On-Time Delivery Guarantee' },
            { icon: <Award size={22} />, text: 'In-House Production with Automation' },
            { icon: <CheckCircle2 size={22} />, text: '5% Discount + Zero Cost EMI' },
          ].map((item, i) => (
            <div key={i} style={styles.trustItem}>
              <div style={styles.trustIcon}>{item.icon}</div>
              <span style={styles.trustText}>{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Ready to Make Your Home a #DecorHome?</h2>
        <p style={styles.ctaSubtitle}>
          Join 2,000+ homeowners who got their dream interiors through Decorpot.
        </p>
        <div style={styles.ctaGroup}>
          <button style={styles.ctaBtn} onClick={handleStartWithPlan}>
            <Upload size={18} />
            Upload Floor Plan
          </button>
          <button style={styles.ctaBtnOutline} onClick={handleStartChat}>
            Start Consultation
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>© {new Date().getFullYear()} Decorpot (Samika Design Solutions Pvt Ltd). All rights reserved.</p>
        <p style={{ marginTop: '4px' }}>Customer Care: 9108602000 | parna.roy@decorpot.com</p>
      </footer>
    </div>
  );
}

function StepIndicator({ current }) {
  const steps = ['Floor Plan', 'Chat', 'Details', 'Quotation'];
  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
      {steps.map((label, i) => (
        <React.Fragment key={i}>
          <div
            style={{
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 600,
              background: i <= current ? '#c53030' : '#e2e8f0',
              color: i <= current ? '#fff' : '#a0aec0',
              transition: 'all 0.3s',
            }}
          >
            {label}
          </div>
          {i < steps.length - 1 && (
            <div style={{ width: '12px', height: '2px', background: i < current ? '#c53030' : '#e2e8f0' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

const styles = {
  landing: { minHeight: '100vh' },
  page: { minHeight: '100vh', background: '#f7fafc' },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 40px',
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontWeight: 800,
    fontSize: '24px',
    color: '#c53030',
    letterSpacing: '-0.5px',
  },
  navLink: {
    fontSize: '14px',
    color: '#718096',
    textDecoration: 'none',
    fontWeight: 500,
  },
  hero: {
    display: 'flex',
    justifyContent: 'center',
    padding: '70px 40px 50px',
    background: 'linear-gradient(180deg, #fff 0%, #f7fafc 100%)',
  },
  heroContent: { maxWidth: '720px', textAlign: 'center' },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 16px',
    borderRadius: '20px',
    background: '#fff5f5',
    color: '#c53030',
    fontSize: '13px',
    fontWeight: 600,
    marginBottom: '20px',
  },
  heroTitle: {
    fontSize: 'clamp(30px, 5vw, 48px)',
    fontWeight: 800,
    color: '#1a202c',
    lineHeight: 1.15,
    letterSpacing: '-1.5px',
    marginBottom: '20px',
  },
  heroAccent: { color: '#c53030' },
  heroSubtitle: {
    fontSize: '16px',
    color: '#718096',
    lineHeight: 1.7,
    maxWidth: '560px',
    margin: '0 auto 28px',
  },
  ctaGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  ctaBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 28px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #e53e3e, #c53030)',
    color: '#fff',
    fontWeight: 700,
    fontSize: '15px',
    boxShadow: '0 4px 20px rgba(229,62,62,0.3)',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  ctaBtnOutline: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 28px',
    borderRadius: '12px',
    border: '2px solid #e53e3e',
    background: 'transparent',
    color: '#c53030',
    fontWeight: 700,
    fontSize: '15px',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  heroStats: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '24px',
    marginTop: '44px',
    flexWrap: 'wrap',
  },
  stat: { textAlign: 'center' },
  statNum: { fontSize: '22px', fontWeight: 800, color: '#1a365d' },
  statLabel: { fontSize: '11px', color: '#a0aec0', marginTop: '2px' },
  statDivider: { width: '1px', height: '32px', background: '#e2e8f0' },
  howSection: { padding: '50px 40px', textAlign: 'center' },
  sectionTitle: {
    fontSize: '26px',
    fontWeight: 800,
    color: '#1a202c',
    marginBottom: '36px',
    letterSpacing: '-0.5px',
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    maxWidth: '880px',
    margin: '0 auto',
  },
  stepCard: {
    position: 'relative',
    padding: '28px 20px',
    background: '#fff',
    borderRadius: '14px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    border: '1px solid #edf2f7',
  },
  stepNum: {
    position: 'absolute',
    top: '-10px',
    left: '20px',
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    background: '#c53030',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIcon: { color: '#c53030', marginBottom: '12px' },
  stepTitle: { fontSize: '16px', fontWeight: 700, color: '#1a202c', marginBottom: '6px' },
  stepDesc: { fontSize: '13px', color: '#718096', lineHeight: 1.6 },
  materialsSection: {
    padding: '50px 40px',
    background: '#1a202c',
    textAlign: 'center',
  },
  materialsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    maxWidth: '880px',
    margin: '0 auto',
  },
  materialCard: {
    padding: '20px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  materialBrand: { fontSize: '16px', fontWeight: 700, color: '#fc8181', marginBottom: '4px' },
  materialDesc: { fontSize: '13px', color: '#a0aec0' },
  trustSection: { padding: '40px', background: '#c53030' },
  trustGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    maxWidth: '900px',
    margin: '0 auto',
  },
  trustItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.12)',
  },
  trustIcon: { color: '#fff', flexShrink: 0 },
  trustText: { color: '#fff', fontSize: '14px', fontWeight: 500 },
  ctaSection: { padding: '50px 40px', textAlign: 'center', background: '#f7fafc' },
  ctaTitle: { fontSize: '26px', fontWeight: 800, color: '#1a202c', marginBottom: '10px' },
  ctaSubtitle: { fontSize: '15px', color: '#718096', marginBottom: '24px' },
  footer: {
    textAlign: 'center',
    padding: '20px',
    borderTop: '1px solid #e2e8f0',
    fontSize: '12px',
    color: '#a0aec0',
  },
  chatWrapper: { maxWidth: '700px', margin: '30px auto', padding: '0 20px' },
  floorPlanWrapper: { maxWidth: '540px', margin: '30px auto', padding: '0 20px' },
  floorPlanActions: {
    marginTop: '16px',
    display: 'flex',
    justifyContent: 'center',
  },
  secondaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    borderRadius: '10px',
    border: 'none',
    background: '#c53030',
    color: '#fff',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer',
  },
  floorPlanBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    marginBottom: '12px',
    borderRadius: '10px',
    background: '#f0fff4',
    border: '1px solid #c6f6d5',
    fontSize: '13px',
    color: '#276749',
  },
  formWrapper: {
    maxWidth: '480px',
    margin: '30px auto',
    padding: '0 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  previewCard: {
    textAlign: 'center',
    padding: '22px',
    background: 'linear-gradient(135deg, #c53030, #9b2c2c)',
    borderRadius: '14px',
    color: '#fff',
  },
  previewLabel: { fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#feb2b2', marginBottom: '4px' },
  previewPkg: { fontSize: '18px', fontWeight: 700 },
  previewCost: { fontSize: '30px', fontWeight: 800, marginTop: '4px' },
  previewInc: { fontSize: '11px', color: '#fed7d7', marginTop: '6px' },
  summaryWrapper: { maxWidth: '620px', margin: '30px auto', padding: '0 20px' },
};
