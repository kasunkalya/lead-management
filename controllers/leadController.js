const Lead = require('../models/Lead');

exports.createLead = async (req, res) => {
    const { name, email, phone, source, status } = req.body;
    const lead = await Lead.create({  name, email, phone, source, status });    
    res.status(201).json(lead);
};

exports.assignLead = async (req, res) => {
   if (req.user.role !== 'Admin') return res.status(403).json({ message: 'Forbidden' });
    const { id } = req.params;
    const { assignedAgentId } = req.body;
    const [updatedRows] = await Lead.update(
        { status: 'Assigned', assignedAgentId },
        { where: { id } }
      );

    if (updatedRows === 0) {
        return res.status(404).json({ message: 'Lead not found' });
    }      
    res.status(200).json({ message: 'Lead assigned' });
};

exports.progressLead = async (req, res) => {  
    const { id } = req.params;
    const { status } = req.body;
    const [updatedRows] = await Lead.update(
        { status},
        { where: { id } }
      );

    if (updatedRows === 0) {
        return res.status(404).json({ message: 'Lead not found' });
    }      
    res.status(200).json({ message: 'Lead updated' });

};

exports.cancelLead = async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const lead = await Lead.findByPk(id);
    if (lead.status !== 'Reserved') return res.status(400).json({ message: 'Cancellation allowed only in reservation stage' });
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