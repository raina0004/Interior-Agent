const Lead = require('../models/Lead');
const { estimateCost } = require('../services/costEstimator');
const { scoreLead } = require('../services/leadScoring');
const { generateQuotationPDF } = require('../services/pdfService');
const { sendQuotationEmail } = require('../services/emailService');

async function getEstimate(req, res) {
  try {
    const { carpetArea, budget, rooms } = req.body;

    if (!carpetArea || !budget) {
      return res.status(400).json({ error: 'Carpet area and budget are required' });
    }

    const estimate = estimateCost({ carpetArea, budget, rooms });
    res.json(estimate);
  } catch (error) {
    console.error('Estimate Error:', error.message);
    res.status(500).json({ error: 'Failed to generate estimate' });
  }
}

async function createLead(req, res) {
  try {
    const {
      name, phone, email,
      propertyType, carpetArea, city,
      budget, timeline, rooms, style, possessionStatus,
      aiRecommendation: clientRecommendation,
    } = req.body;

    if (!name || !phone || !email) {
      return res.status(400).json({ error: 'Name, phone, and email are required' });
    }

    const estimate = estimateCost({ carpetArea, budget, rooms });

    const scoring = scoreLead({ budget, rooms, timeline, carpetArea, propertyType });

    const aiRecommendation = clientRecommendation ||
      'Our design team will provide personalized suggestions shortly.';

    const lead = new Lead({
      name, phone, email,
      propertyType, carpetArea, city,
      budget, timeline, rooms, style, possessionStatus,
      packageType: estimate.packageType,
      costPerSqFt: estimate.costPerSqFt,
      estimatedCost: estimate.estimatedCost,
      costBreakdown: estimate.costBreakdown,
      leadScore: scoring.leadScore,
      leadCategory: scoring.leadCategory,
      aiRecommendation,
    });

    lead.save();

    let pdfResult = null;
    try {
      pdfResult = await generateQuotationPDF(lead.toObject());
      lead.pdfUrl = `/api/pdf/${pdfResult.fileName}`;
      lead.save();
    } catch (pdfErr) {
      console.error('PDF generation failed:', pdfErr.message);
    }

    try {
      if (pdfResult) {
        await sendQuotationEmail(lead.toObject(), pdfResult.filePath);
      }
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
    }

    res.status(201).json({
      success: true,
      lead: {
        id: lead._id,
        name: lead.name,
        email: lead.email,
        packageType: lead.packageType,
        estimatedCost: lead.estimatedCost,
        costPerSqFt: lead.costPerSqFt,
        leadScore: lead.leadScore,
        leadCategory: lead.leadCategory,
        aiRecommendation: lead.aiRecommendation,
        pdfUrl: lead.pdfUrl,
        costBreakdown: lead.costBreakdown,
        features: estimate.features,
        paymentMilestones: estimate.paymentMilestones,
      },
    });
  } catch (error) {
    console.error('Lead Creation Error:', error.message);
    res.status(500).json({ error: 'Failed to create lead' });
  }
}

async function getAllLeads(req, res) {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (category) filter.leadCategory = category;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const { leads, total } = Lead.findAll({ filter, skip, limit: limitNum });

    res.json({
      leads,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get Leads Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
}

async function getLeadById(req, res) {
  try {
    const lead = Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(lead);
  } catch (error) {
    console.error('Get Lead Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
}

async function generatePDF(req, res) {
  try {
    const leadData = req.body;
    const result = await generateQuotationPDF(leadData);
    res.json({ success: true, fileName: result.fileName, downloadUrl: `/api/pdf/${result.fileName}` });
  } catch (error) {
    console.error('PDF Error:', error.message);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
}

module.exports = { getEstimate, createLead, getAllLeads, getLeadById, generatePDF };
