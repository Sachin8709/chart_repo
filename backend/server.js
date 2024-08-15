// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const transactionRoutes = require('./routes/transactionRoutes'); // Import the transaction routes

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/transactionsDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('Connection error:', err));

app.use(cors());
app.use(express.json());

// Use the transaction routes
app.use('/api/transactions', transactionRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
