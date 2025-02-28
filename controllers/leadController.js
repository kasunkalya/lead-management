const Lead = require('../models/Lead');
const { check, validationResult } = require('express-validator');
const logger = require('../config/logger');


exports.createLead = [ 
  check('name').notEmpty().withMessage('Name is required'),
  check('email').isEmail().withMessage('A valid email is required'),
  check('phone').notEmpty().withMessage('Phone number is required'),
  check('source').notEmpty().withMessage('Source is required'),  
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


exports.assignLead = async (req, res) => {
   if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Forbidden' });
    const { id } = req.params;
    const { assignedAgentId } = req.body;
    const [updatedRows] = await Lead.update(
        { status: 'Assigned', assignedAgentId },
        { where: { id, status: 'Unassigned' } }
      );

    if (updatedRows === 0) {
        return res.status(404).json({ message: 'Lead not found or already assigned' });
    }      
    res.status(200).json({ message: 'Lead assigned' });
};


exports.progressLead = async (req, res) => {  
    const { id } = req.params;
    const { status: newStatus } = req.body;
  
    try {
     
      const lead = await Lead.findByPk(id);
      if (!lead) {
        return res.status(404).json({ message: 'Lead not found' });
      }
  
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
      lead.status = newStatus;
      await lead.save();
  
      res.status(200).json({ message: 'Lead updated', lead });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
};


exports.cancelLead = async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const lead = await Lead.findByPk(id);
    if (lead.status !== 'Reserved') return res.status(400).json({ message: 'Cancellation allowed only in reservation stage' });
    logger.info({
        message: 'Lead cancelled',
        leadId: id,
        reason: reason,
        timestamp: new Date().toISOString()
      });
    
    await Lead.destroy({ where: { id } });
    res.json({ message: 'Lead cancelled', reason });
};

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