const express = require('express');
const router = express.Router();
const {
  getEstimate,
  createLead,
  getAllLeads,
  getLeadById,
  generatePDF,
} = require('../controllers/leadController');

router.post('/estimate', getEstimate);
router.post('/lead', createLead);
router.get('/leads', getAllLeads);
router.get('/lead/:id', getLeadById);
router.post('/pdf', generatePDF);

module.exports = router;
