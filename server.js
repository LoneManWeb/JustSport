const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database(':memory:');

// Create products table
db.serialize(() => {
    db.run(`CREATE TABLE products (
        id TEXT PRIMARY KEY,
        category TEXT,
        name TEXT,
        price REAL,
        stock INTEGER,
        image TEXT,
        description TEXT,
        specs TEXT
    )`);
});

// API routes
app.get('/api/products', (req, res) => {
    db.all('SELECT * FROM products', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.post('/api/products', (req, res) => {
    const { id, category, name, price, stock, image, description, specs } = req.body;
    db.run(`INSERT INTO products (id, category, name, price, stock, image, description, specs) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
    [id, category, name, price, stock, image, description, specs], 
    function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID });
    });
});

app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM products WHERE id = ?`, id, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(204).send();
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
