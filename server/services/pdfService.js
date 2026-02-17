const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const PDF_DIR = path.join(__dirname, '..', 'pdfs');

if (!fs.existsSync(PDF_DIR)) {
  fs.mkdirSync(PDF_DIR, { recursive: true });
}

function formatCurrency(amount) {
  return '\u20B9' + Number(amount).toLocaleString('en-IN');
}

function generateQuotationPDF(leadData) {
  return new Promise((resolve, reject) => {
    const fileName = `decorpot-quotation-${leadData._id || Date.now()}.pdf`;
    const filePath = path.join(PDF_DIR, fileName);
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    const primaryColor = '#c53030';
    const darkColor = '#1a202c';
    const lightBg = '#f7fafc';

    // Header
    doc.rect(0, 0, doc.page.width, 110).fill(primaryColor);

    doc
      .fontSize(28)
      .fill('#ffffff')
      .font('Helvetica-Bold')
      .text('Decorpot', 50, 30);

    doc
      .fontSize(9)
      .fill('#fed7d7')
      .font('Helvetica')
      .text('Samika Design Solutions Pvt Ltd', 50, 62)
      .text('Customer Care: 9108602000 | www.decorpot.com', 50, 76);

    const quotationNo = `DP-${Date.now().toString().slice(-8)}`;
    const date = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    doc
      .fontSize(9)
      .fill('#ffffff')
      .text(`Ref: ${quotationNo}`, 380, 40, { align: 'right', width: 150 })
      .text(`Date: ${date}`, 380, 55, { align: 'right', width: 150 });

    // Title
    let y = 125;
    doc
      .fontSize(16)
      .fill(darkColor)
      .font('Helvetica-Bold')
      .text('INTERIOR DESIGN QUOTATION', 50, y, { align: 'center' });

    // Client details
    y += 35;
    doc.fontSize(11).fill(primaryColor).font('Helvetica-Bold').text('CLIENT DETAILS', 50, y);
    y += 20;

    const clientInfo = [
      ['Name', leadData.name],
      ['Email', leadData.email],
      ['Phone', leadData.phone],
      ['Property', `${leadData.propertyType} in ${leadData.city}`],
      ['Area', `${leadData.carpetArea} sq ft`],
      ['Timeline', leadData.timeline],
    ];

    clientInfo.forEach(([label, value]) => {
      doc
        .fontSize(9)
        .fill('#4a5568')
        .font('Helvetica-Bold')
        .text(`${label}:`, 50, y, { continued: true })
        .font('Helvetica')
        .text(`  ${value || 'N/A'}`);
      y += 15;
    });

    // Quotation summary table
    y += 15;
    doc.fontSize(11).fill(primaryColor).font('Helvetica-Bold').text('QUOTATION SUMMARY', 50, y);
    y += 20;

    // Table header
    doc.rect(50, y, doc.page.width - 100, 22).fill('#f7fafc');
    doc
      .fontSize(8)
      .fill('#718096')
      .font('Helvetica-Bold')
      .text('S.NO', 55, y + 6)
      .text('ROOM / CATEGORY', 90, y + 6)
      .text('TOTAL COSTING', 400, y + 6, { align: 'right', width: 100 });
    y += 26;

    if (leadData.costBreakdown) {
      let sno = 1;
      Object.entries(leadData.costBreakdown).forEach(([room, cost]) => {
        if (y > 720) {
          doc.addPage();
          y = 50;
        }
        doc
          .fontSize(9)
          .fill(darkColor)
          .font('Helvetica')
          .text(String(sno), 55, y)
          .text(room, 90, y)
          .font('Helvetica-Bold')
          .text(formatCurrency(cost), 400, y, { align: 'right', width: 100 });
        y += 16;
        sno++;
      });
    }

    // Totals
    y += 10;
    doc.moveTo(50, y).lineTo(doc.page.width - 50, y).strokeColor('#e2e8f0').lineWidth(1).stroke();
    y += 10;

    const estCost = leadData.estimatedCost || 0;
    const subtotalBeforeDiscount = Math.round(estCost / 1.18 / 0.95);
    const discount = Math.round(subtotalBeforeDiscount * 0.05);
    const subtotal = subtotalBeforeDiscount - discount;
    const gst = Math.round(subtotal * 0.18);

    const totals = [
      ['TOTAL QUOTATION VALUE', formatCurrency(subtotalBeforeDiscount)],
      ['DISCOUNT @ 5%', '- ' + formatCurrency(discount)],
      ['SUB TOTAL', formatCurrency(subtotal)],
      ['GST @ 18%', formatCurrency(gst)],
    ];

    totals.forEach(([label, value]) => {
      doc
        .fontSize(9)
        .fill('#4a5568')
        .font('Helvetica')
        .text(label, 250, y)
        .font('Helvetica-Bold')
        .text(value, 400, y, { align: 'right', width: 100 });
      y += 16;
    });

    // Grand total
    y += 4;
    doc.rect(250, y, doc.page.width - 300, 28).fill(primaryColor);
    doc
      .fontSize(11)
      .fill('#fff')
      .font('Helvetica-Bold')
      .text('TOTAL CUSTOMER OUTFLOW', 260, y + 7)
      .text(formatCurrency(estCost), 400, y + 7, { align: 'right', width: 100 });

    // Payment schedule
    y += 45;
    if (y > 680) { doc.addPage(); y = 50; }

    doc.fontSize(11).fill(primaryColor).font('Helvetica-Bold').text('PAYMENT SCHEDULE', 50, y);
    y += 20;

    const payments = [
      ['1.', '10% of the quotation for design meetings and booking confirmation.'],
      ['2.', '50% upon signing of the contract.'],
      ['3.', '40% before delivery of the modular furnitures at the site.'],
      ['4.', 'Amount once paid are non refundable.'],
      ['5.', 'Minimum project value: 4 Lakhs excluding GST.'],
      ['6.', 'Zero Cost EMI for 24 months (if no discount applied).'],
    ];

    payments.forEach(([num, text]) => {
      doc.fontSize(8).fill('#4a5568').font('Helvetica').text(`${num} ${text}`, 55, y, { width: 460 });
      y += 14;
    });

    // Material specification
    y += 15;
    if (y > 680) { doc.addPage(); y = 50; }

    doc.fontSize(11).fill(primaryColor).font('Helvetica-Bold').text('MATERIAL SPECIFICATION', 50, y);
    y += 20;

    const materials = [
      ['Plywood (Dry Areas)', '303 (MR Grade)'],
      ['Plywood (Wet Areas)', 'Green Ply 710 (BWP Ply)'],
      ['Outer Laminate (1mm)', 'Stylam / Airolam'],
      ['Hinges and Channels', 'Hettich'],
      ['Glass', 'Modiguard / AIS / Saint Gobain'],
    ];

    materials.forEach(([item, brand]) => {
      doc
        .fontSize(9)
        .fill('#4a5568')
        .font('Helvetica-Bold')
        .text(item, 55, y, { continued: true })
        .font('Helvetica')
        .text(`:  ${brand}`);
      y += 15;
    });

    // Warranty
    y += 15;
    doc.fontSize(11).fill(primaryColor).font('Helvetica-Bold').text('WARRANTY', 50, y);
    y += 18;
    doc.fontSize(8).fill('#4a5568').font('Helvetica')
      .text('Decorpot 10-Year Warranty: All woodwork is covered against any defect in manufacturing or installation workmanship.', 55, y, { width: 460 });

    // Footer
    const footerY = doc.page.height - 50;
    doc.moveTo(50, footerY).lineTo(doc.page.width - 50, footerY).strokeColor('#e2e8f0').lineWidth(1).stroke();

    doc
      .fontSize(7)
      .fill('#a0aec0')
      .font('Helvetica')
      .text(
        'This quotation is computer-generated by Decorpot (Samika Design Solutions Pvt Ltd). Valid for 30 days from issue date.',
        50, footerY + 8,
        { align: 'center', width: doc.page.width - 100 }
      );

    doc.end();

    stream.on('finish', () => resolve({ filePath, fileName }));
    stream.on('error', reject);
  });
}

module.exports = { generateQuotationPDF };
