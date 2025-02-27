 
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./models');
const userRoutes = require('./routes/userRoutes');
const leadRoutes = require('./routes/leadRoutes');

const app = express();
app.use(bodyParser.json());

app.use('/users', userRoutes);
app.use('/leads', leadRoutes);

sequelize.sync().then(() => {
   app.listen(3000, () => console.log('Server running on port 3000'));
});
