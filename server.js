const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const db = new sqlite3.Database(':memory:');

app.use(cors());
app.use(bodyParser.json());

// Initialize database tables
db.serialize(() => {
    db.run("CREATE TABLE products (id INTEGER PRIMARY KEY AUTOINCREMENT, category TEXT, name TEXT, price REAL, stock INTEGER, image TEXT, description TEXT, specs TEXT)");
    db.run("CREATE TABLE cart (id INTEGER PRIMARY KEY AUTOINCREMENT, productId INTEGER, quantity INTEGER, FOREIGN KEY(productId) REFERENCES products(id))");
});

// API routes
app.get('/api/products', (req, res) => {
    db.all("SELECT * FROM products", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

app.post('/api/products', (req, res) => {
    const { category, name, price, stock, image, description, specs } = req.body;
    db.run("INSERT INTO products (category, name, price, stock, image, description, specs) VALUES (?, ?, ?, ?, ?, ?, ?)", 
        [category, name, price, stock, image, description, specs], 
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ id: this.lastID });
            }
        });
});

app.delete('/api/products/:id', (req, res) => {
    db.run("DELETE FROM products WHERE id = ?", req.params.id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ deletedID: req.params.id });
        }
    });
});

app.post('/api/cart', (req, res) => {
    const { id, quantity } = req.body;
    db.run("INSERT INTO cart (productId, quantity) VALUES (?, ?)", [id, quantity], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ id: this.lastID });
        }
    });
});

// Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
