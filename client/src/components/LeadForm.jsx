import React, { useState } from 'react';
import { User, Phone, Mail, Loader2, ArrowRight } from 'lucide-react';

export default function LeadForm({ onSubmit, isLoading }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    else if (!/^[6-9]\d{9}$/.test(form.phone.trim()))
      errs.phone = 'Enter a valid 10-digit Indian phone number';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email.trim()))
      errs.email = 'Enter a valid email';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
      });
    }
  };

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: null });
  };

  return (
    <div style={styles.container} className="slide-up">
      <div style={styles.header}>
        <h2 style={styles.title}>Almost There!</h2>
        <p style={styles.subtitle}>
          Enter your details to receive your personalized quotation and design recommendations.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.field}>
          <label style={styles.label}>Full Name</label>
          <div style={styles.inputWrap}>
            <User size={18} color="#a0aec0" style={styles.icon} />
            <input
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange('name')}
              style={{
                ...styles.input,
                borderColor: errors.name ? '#e53e3e' : '#e2e8f0',
              }}
            />
          </div>
          {errors.name && <span style={styles.error}>{errors.name}</span>}
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Phone Number</label>
          <div style={styles.inputWrap}>
            <Phone size={18} color="#a0aec0" style={styles.icon} />
            <input
              type="tel"
              placeholder="9876543210"
              value={form.phone}
              onChange={handleChange('phone')}
              style={{
                ...styles.input,
                borderColor: errors.phone ? '#e53e3e' : '#e2e8f0',
              }}
            />
          </div>
          {errors.phone && <span style={styles.error}>{errors.phone}</span>}
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Email Address</label>
          <div style={styles.inputWrap}>
            <Mail size={18} color="#a0aec0" style={styles.icon} />
            <input
              type="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={handleChange('email')}
              style={{
                ...styles.input,
                borderColor: errors.email ? '#e53e3e' : '#e2e8f0',
              }}
            />
          </div>
          {errors.email && <span style={styles.error}>{errors.email}</span>}
        </div>

        <button
          type="submit"
          style={{
            ...styles.submitBtn,
            opacity: isLoading ? 0.7 : 1,
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              Creating Your Quotation...
            </>
          ) : (
            <>
              Get My Quotation
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <p style={styles.privacy}>
        Your information is secure and will only be used to send you the quotation.
      </p>
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
  header: {
    padding: '28px 28px 0',
  },
  title: {
    fontSize: '22px',
    fontWeight: 700,
    color: '#1a365d',
    marginBottom: '6px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#718096',
    lineHeight: 1.5,
  },
  form: {
    padding: '24px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#4a5568',
  },
  inputWrap: {
    position: 'relative',
  },
  icon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '12px 14px 12px 42px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    background: '#f7fafc',
  },
  error: {
    fontSize: '12px',
    color: '#e53e3e',
  },
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '14px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #e53e3e, #c53030)',
    color: '#fff',
    fontWeight: 600,
    fontSize: '15px',
    marginTop: '8px',
    transition: 'all 0.2s',
  },
  privacy: {
    fontSize: '11px',
    color: '#a0aec0',
    textAlign: 'center',
    padding: '0 28px 20px',
  },
};
