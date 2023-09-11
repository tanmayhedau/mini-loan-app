const express = require('express');
const dotenv = require('dotenv').config();
const connectDB = require("./database/db");
const cors = require('cors');
const route = require('./routes/route');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 8000;

connectDB();

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));
app.use('/', route);


app.get('/', (req, res) => {
  res.send('server is ready..');
});

app.listen(PORT, () => {
  console.log(`Server is running successfully at port no. ${PORT} `);
});