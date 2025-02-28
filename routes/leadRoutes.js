const express = require('express');
const { createLead, assignLead, progressLead, cancelLead, getLeads } = require('../controllers/leadController');
const authenticateJWT = require('../middleware/auth');

const router = express.Router();
router.post('/', authenticateJWT, createLead);
router.put('/assign/:id', authenticateJWT, assignLead);
router.put('/progress/:id',progressLead);
router.delete('/cancel/:id', authenticateJWT, cancelLead);
router.get('/',getLeads);
 
module.exports = router;
