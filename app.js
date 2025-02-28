require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const leadRoutes = require('./routes/leadRoutes');


const app = express();


app.use(bodyParser.json());

app.use('/users', userRoutes);
app.use('/leads', leadRoutes);
app.use(express.json());


module.exports = app;
