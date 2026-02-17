const nodemailer = require('nodemailer');
const path = require('path');

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

async function sendQuotationEmail(leadData, pdfPath) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Email not configured — skipping email send');
    return { success: false, reason: 'Email credentials not configured' };
  }

  const transporter = createTransporter();
  const companyName = process.env.COMPANY_NAME || 'InteriorAI Design Studio';

  const htmlBody = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background: #c53030; padding: 30px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 24px;">${companyName}</h1>
        <p style="color: #fed7d7; margin: 5px 0 0;">Samika Design Solutions Pvt Ltd | www.decorpot.com</p>
      </div>
      
      <div style="padding: 30px; background: #f7fafc;">
        <h2 style="color: #1a365d; margin-top: 0;">Hello ${leadData.name}! 👋</h2>
        
        <p>Thank you for considering Decorpot for your interior design! With 2000+ homes delivered and a 10-year warranty, we're thrilled to help make your home a beautiful #DecorHome.</p>
        
        <div style="background: #fff; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #e53e3e;">
          <h3 style="margin-top: 0; color: #1a365d;">Your Project Summary</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #718096;">Property</td><td style="padding: 8px 0; font-weight: bold;">${leadData.propertyType} in ${leadData.city}</td></tr>
            <tr><td style="padding: 8px 0; color: #718096;">Package</td><td style="padding: 8px 0; font-weight: bold;">${leadData.packageType}</td></tr>
            <tr><td style="padding: 8px 0; color: #718096;">Estimated Cost</td><td style="padding: 8px 0; font-weight: bold; color: #e53e3e;">₹${Number(leadData.estimatedCost).toLocaleString('en-IN')}</td></tr>
            <tr><td style="padding: 8px 0; color: #718096;">Timeline</td><td style="padding: 8px 0; font-weight: bold;">${leadData.timeline}</td></tr>
          </table>
        </div>
        
        <p>Please find your detailed quotation attached as a PDF. Our design consultant will reach out to you within 24 hours to discuss the next steps.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #718096; font-size: 14px;">Questions? Call us at <strong>${process.env.COMPANY_PHONE || '+91-9876543210'}</strong></p>
        </div>
      </div>
      
      <div style="background: #c53030; padding: 15px; text-align: center;">
        <p style="color: #cbd5e0; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"${companyName}" <${process.env.EMAIL_USER}>`,
    to: leadData.email,
    subject: `Your Interior Design Quotation — ${companyName}`,
    html: htmlBody,
    attachments: pdfPath
      ? [
          {
            filename: path.basename(pdfPath),
            path: pdfPath,
          },
        ]
      : [],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send failed:', error.message);
    return { success: false, reason: error.message };
  }
}

module.exports = { sendQuotationEmail };
