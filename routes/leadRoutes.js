const express = require('express');
const { createLead, assignLead, progressLead, cancelLead, getLeads } = require('../controllers/leadController');
const authenticateJWT = require('../middleware/auth');

const router = express.Router();
router.post('/', authenticateJWT, createLead);
router.put('/:id/assign', authenticateJWT, assignLead);
router.put('/:id/progress', authenticateJWT, progressLead);
router.delete('/:id/cancel', authenticateJWT, cancelLead);
router.get('/', authenticateJWT, getLeads);

module.exports = router;
