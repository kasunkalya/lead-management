const Lead = require('../models/Lead');

exports.createLead = async (req, res) => {
    const { name, contact, source } = req.body;
    const lead = await Lead.create({ name, contact, source });
    res.json(lead);
};

exports.assignLead = async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const { id } = req.params;
    const { agentId } = req.body;
    await Lead.update({ status: 'assigned', agentId }, { where: { id } });
    res.json({ message: 'Lead assigned' });
};

exports.progressLead = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    await Lead.update({ status }, { where: { id } });
    res.json({ message: 'Lead updated' });
};

exports.cancelLead = async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const lead = await Lead.findByPk(id);
    if (lead.status !== 'reservation') return res.status(400).json({ message: 'Cancellation allowed only in reservation stage' });
    await Lead.destroy({ where: { id } });
    res.json({ message: 'Lead cancelled', reason });
};

exports.getLeads = async (req, res) => {
    const { status, agentId, startDate, endDate } = req.query;
    const whereClause = {};

    if (status) {
        whereClause.status = status;
    }

    if (agentId) {
        whereClause.agentId = agentId;
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