// backend/controllers/transactionController.js
const axios = require('axios');
const Transaction = require('../models/Transaction');

// Initialize Database with Seed Data
const initializeDatabase = async (req, res) => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const transactions = response.data;
    
    await Transaction.deleteMany({});
    await Transaction.insertMany(transactions);
    
    res.status(200).json({ message: 'Database initialized successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Database initialization failed', error });
  }
};

// List Transactions with Search and Pagination
const listTransactions = async (req, res) => {
  try {
    const { page = 1, perPage = 10, search = '', month } = req.query;
    const regex = new RegExp(search, 'i');
    
    const query = {
      dateOfSale: { $regex: `^${month}`, $options: 'i' },
      $or: [
        { title: regex },
        { description: regex },
        { price: { $regex: regex } },
      ],
    };
    
    const transactions = await Transaction.find(query)
      .skip((page - 1) * perPage)
      .limit(parseInt(perPage));
    
    const count = await Transaction.countDocuments(query);
    
    res.status(200).json({ transactions, count });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch transactions', error });
  }
};

// Statistics API
const getStatistics = async (req, res) => {
  try {
    const { month } = req.query;

    const totalSale = await Transaction.aggregate([
      { $match: { dateOfSale: { $regex: `^${month}`, $options: 'i' } } },
      { $group: { _id: null, totalSaleAmount: { $sum: '$price' }, totalSoldItems: { $sum: { $cond: ['$sold', 1, 0] } }, totalNotSoldItems: { $sum: { $cond: ['$sold', 0, 1] } } } }
    ]);

    res.status(200).json(totalSale[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch statistics', error });
  }
};

// Bar Chart API
const getBarChart = async (req, res) => {
  try {
    const { month } = req.query;

    const priceRanges = [
      { range: '0-100', min: 0, max: 100 },
      { range: '101-200', min: 101, max: 200 },
      { range: '201-300', min: 201, max: 300 },
      { range: '301-400', min: 301, max: 400 },
      { range: '401-500', min: 401, max: 500 },
      { range: '501-600', min: 501, max: 600 },
      { range: '601-700', min: 601, max: 700 },
      { range: '701-800', min: 701, max: 800 },
      { range: '801-900', min: 801, max: 900 },
      { range: '901-above', min: 901, max: Number.MAX_SAFE_INTEGER }
    ];

    const barChart = await Promise.all(priceRanges.map(async (range) => {
      const count = await Transaction.countDocuments({
        dateOfSale: { $regex: `^${month}`, $options: 'i' },
        price: { $gte: range.min, $lte: range.max },
      });

      return { range: range.range, count };
    }));

    res.status(200).json(barChart);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bar chart data', error });
  }
};

// Pie Chart API
const getPieChart = async (req, res) => {
  try {
    const { month } = req.query;

    const pieChart = await Transaction.aggregate([
      { $match: { dateOfSale: { $regex: `^${month}`, $options: 'i' } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    res.status(200).json(pieChart);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch pie chart data', error });
  }
};

// Combined API
const getCombinedData = async (req, res) => {
  try {
    const { month } = req.query;

    const statistics = await getStatistics({ query: { month } });
    const barChart = await getBarChart({ query: { month } });
    const pieChart = await getPieChart({ query: { month } });

    const combinedData = {
      statistics: statistics.data,
      barChart: barChart.data,
      pieChart: pieChart.data,
    };

    res.status(200).json(combinedData);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching combined data", details: error.message });
  }
};


module.exports = {
  initializeDatabase,
  listTransactions,
  getStatistics,
  getBarChart,
  getPieChart,
  getCombinedData
};
