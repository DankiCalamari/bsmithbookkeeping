const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { sequelize } = require('./models');
const auth = require('./middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Initialize Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Models
const User = require('./models/user')(sequelize);
const Transaction = require('./models/transaction')(sequelize);
const Quote = require('./models/quote')(sequelize);
const Invoice = require('./models/invoice')(sequelize);

// Sync database
sequelize.sync();

// User registration
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const newUser = await User.create({ username, password: hashedPassword });
        res.json(newUser);
    } catch (error) {
        res.status(400).json({ error: 'Username already exists' });
    }
});

// User login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(400).json({ error: 'Cannot find user' });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return res.status(403).json({ error: 'Incorrect password' });

    const token = jwt.sign({ username: user.username }, 'SECRET_KEY');
    res.json({ token });
});

// Transactions routes
app.get('/transactions', auth, async (req, res) => {
    const transactions = await Transaction.findAll();
    res.json(transactions);
});

app.post('/transactions', auth, async (req, res) => {
    const { description, amount } = req.body;
    const newTransaction = await Transaction.create({ description, amount });
    res.json(newTransaction);
});

app.delete('/transactions/:id', auth, async (req, res) => {
    await Transaction.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Transaction deleted' });
});

// Quotes routes
app.get('/quotes', auth, async (req, res) => {
    const quotes = await Quote.findAll();
    res.json(quotes);
});

app.post('/quotes', auth, async (req, res) => {
    const { text, author } = req.body;
    const newQuote = await Quote.create({ text, author });
    res.json(newQuote);
});

app.delete('/quotes/:id', auth, async (req, res) => {
    await Quote.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Quote deleted' });
});

// Invoices routes
app.get('/invoices', auth, async (req, res) => {
    const invoices = await Invoice.findAll();
    res.json(invoices);
});

app.post('/invoices', auth, upload.single('file'), async (req, res) => {
    const { customerName, totalAmount, dueDate } = req.body;
    const filePath = req.file ? req.file.path : null;
    const newInvoice = await Invoice.create({ customerName, totalAmount, dueDate, filePath });
    res.json(newInvoice);
});

app.delete('/invoices/:id', auth, async (req, res) => {
    await Invoice.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Invoice deleted' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
