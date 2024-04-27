const mongoose = require("mongoose");
require('dotenv').config()

mongoose.connect(process.env.DB_CONNECT)
  .then(() => {
    console.log('Connected to database');
  })
  .catch((e) => {
    console.log('Error occurred in connection', e);
  });
