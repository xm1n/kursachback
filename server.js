const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Получение всех товаров
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

// Добавление товара
app.post('/api/products', async (req, res) => {
  const { name, price, quantity, category, subcategory, status } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO products (name, price, quantity, category, subcategory, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, price, quantity, category, subcategory, status || 'available']
    );
    const [newProduct] = await db.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.json(newProduct[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

// Редактирование товара
app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, quantity, category, subcategory, status } = req.body;
  try {
    await db.query(
      'UPDATE products SET name = ?, price = ?, quantity = ?, category = ?, subcategory = ?, status = ? WHERE id = ?',
      [name, price, quantity, category, subcategory, status, id]
    );
    const [updatedProduct] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    res.json(updatedProduct[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

// Удаление товара
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM products WHERE id = ?', [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

// Добавление чека
app.post('/api/receipts', async (req, res) => {
  const { items, total } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO receipts (items, total) VALUES (?, ?)',
      [JSON.stringify(items), total]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

// Получение всех чеков
app.get('/api/receipts', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM receipts');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});