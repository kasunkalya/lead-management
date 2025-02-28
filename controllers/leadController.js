/**
 * @fileoverview Controller functions for managing leads.
 * Contains functions to create, assign, progress, cancel, and retrieve leads.
 */

const Lead = require('../models/Lead');
const { check, validationResult } = require('express-validator');
const logger = require('../config/logger');



/**
 * Create Lead & Capture
 * Validates input and creates a new lead.
 * @example POST /leads
 */

exports.createLead = [ 
// Input validation middleware using express-validator
  check('name').notEmpty().withMessage('Name is required'),
  check('email').isEmail().withMessage('A valid email is required'),
  check('phone').notEmpty().withMessage('Phone number is required'),
  check('source').notEmpty().withMessage('Source is required'),  

  // Controller function
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, phone, source, status } = req.body;    
    try {
      const lead = await Lead.create({ name, email, phone, source, status });
      res.status(201).json(lead);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
];


/**
 * Assign Lead
 * Assigns a lead to a sales agent if the lead is unassigned and the user is an Admin.
 * @example PUT /leads/assign/:id
 */
exports.assignLead = async (req, res) => {
   if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Forbidden' });
    const { id } = req.params;
    const { assignedAgentId } = req.body;

     // Update lead only if its current status is 'Unassigned'
    const [updatedRows] = await Lead.update(
        { status: 'Assigned', assignedAgentId },
        { where: { id, status: 'Unassigned' } }
      );

    if (updatedRows === 0) {
        return res.status(404).json({ message: 'Lead not found or already assigned' });
    }      
    res.status(200).json({ message: 'Lead assigned' });
};


/**
 * Progress Lead
 * Progresses a lead to a new status ensuring valid state transitions.
 * Allowed transitions:
 * - Unassigned -> Assigned
 * - Assigned -> Reserved
 * - Reserved -> Sold
 * @example PUT /leads/progress/:id
 */
exports.progressLead = async (req, res) => {  
    const { id } = req.params;
    const { status: newStatus } = req.body;
  
    try {
     
      const lead = await Lead.findByPk(id);
      if (!lead) {
        return res.status(404).json({ message: 'Lead not found' });
      }
  
    // Define allowed transitions for status updates
      const allowedTransitions = {
        'Unassigned': ['Assigned'],
        'Assigned': ['Reserved'],
        'Reserved': ['Sold']
      };
  
      const currentStatus = lead.status;
      const allowed = allowedTransitions[currentStatus];

      if (!allowed || !allowed.includes(newStatus)) {
        return res.status(400).json({ 
          message: `Invalid status transition from ${currentStatus} to ${newStatus}` 
        });
      }  

      // Update the lead's status and save the changes
      lead.status = newStatus;
      await lead.save();
  
      res.status(200).json({ message: 'Lead updated', lead });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
};



/**
 * Cancel Lead
 * Cancels a lead if it is in the 'Reserved' stage.
 * Logs the cancellation reason using Winston.
 * @example DELETE /leads/cancel/:id
 */

exports.cancelLead = async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const lead = await Lead.findByPk(id);
    if (lead.status !== 'Reserved') return res.status(400).json({ message: 'Cancellation allowed only in reservation stage' });
    
    // Log the cancellation reason to a file using Winston
    logger.info({
        message: 'Lead cancelled',
        leadId: id,
        reason: reason,
        timestamp: new Date().toISOString()
      });
    
    await Lead.destroy({ where: { id } });
    res.json({ message: 'Lead cancelled', reason });
};


/**
 * Get Leads
 * Retrieves leads with optional filtering by status, assigned agent, and date range.
 * @example GET /leads?status=Assigned&assignedAgentId=2
 */
exports.getLeads = async (req, res) => {
    const { status, assignedAgentId, startDate, endDate } = req.query;
    const whereClause = {};

    if (status) {
        whereClause.status = status;
    }

    if (assignedAgentId) {
        whereClause.assignedAgentId = assignedAgentId;
    }

    if (startDate && endDate) {
        whereClause.createdAt = {
            [Op.between]: [new Date(startDate), new Date(endDate)]
        };
    } else if (startDate) {
        whereClause.createdAt = {
            [Op.gte]: new Date(startDate)
        };
    } else if (endDate) {
        whereClause.createdAt = {
            [Op.lte]: new Date(endDate)
        };
    }

    try {
        const leads = await Lead.findAll({ where: whereClause });
        res.json(leads);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};