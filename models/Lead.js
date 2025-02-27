const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Lead = sequelize.define('Lead', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    contact: { type: DataTypes.STRING, allowNull: false },
    source: { type: DataTypes.STRING, allowNull: false },
    status: { 
        type: DataTypes.ENUM('unassigned', 'assigned', 'reservation', 'financial_approved', 'legal_finalized', 'sold'), 
        defaultValue: 'unassigned' 
    },
    agentId: { type: DataTypes.INTEGER, allowNull: true }
},
{
    timestamps: true 
});

module.exports = Lead;
