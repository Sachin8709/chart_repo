const express = require('express');
const router = express.Router();
const { listTransactions, getStatistics, getBarChart, getPieChart, getCombinedData } = require('../controllers/transactionController');

// Route for listing transactions with search and pagination
router.get('/', listTransactions);

// Route for getting statistics
router.get('/statistics', getStatistics);

// Route for getting bar chart data
router.get('/barchart', getBarChart);

// Route for getting pie chart data
router.get('/piechart', getPieChart);

// Route for getting combined data
router.get('/combined', getCombinedData);

module.exports = router;
