const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Untuk menerima JSON
app.use(express.urlencoded({ extended: true })); // Untuk menerima form-data

// Setup database connection
const db = mysql.createConnection({
  host: '34.28.203.160',
  user: 'root',
  password: '', // Password kosong
  database: 'ham'
});

// Connect to the database
db.connect(err => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }

  // Create table if not exists
  db.query(`
    CREATE TABLE IF NOT EXISTS notes (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error('Failed to create table: ' + err.message);
      return;
    }
    console.log('Table checked/created successfully.');
  });

  console.log('Connected to MySQL database.');
});

// CRUD Routes
// Create Note
app.post('/notes', (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  const query = 'INSERT INTO notes (title, content) VALUES (?, ?)';
  db.query(query, [title, content], (err, result) => {
    if (err) {
      console.error('Failed to add note:', err);
      return res.status(500).json({ message: 'Failed to add note' });
    }
    res.status(201).json({ message: 'Note added successfully', id: result.insertId });
  });
});

// Get All Notes
app.get('/notes', (req, res) => {
  db.query('SELECT * FROM notes', (err, results) => {
    if (err) {
      console.error('Failed to fetch notes:', err);
      return res.status(500).json({ message: 'Failed to fetch notes' });
    }
    res.status(200).json(results);
  });
});

// Get Single Note
app.get('/notes/:id', (req, res) => {
  const noteId = req.params.id;
  db.query('SELECT * FROM notes WHERE id = ?', [noteId], (err, result) => {
    if (err) {
      console.error('Failed to fetch note:', err);
      return res.status(500).json({ message: 'Failed to fetch note' });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(200).json(result[0]);
  });
});

// Update Note
app.put('/notes/:id', (req, res) => {
  const noteId = req.params.id;
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  db.query('UPDATE notes SET title = ?, content = ? WHERE id = ?', [title, content, noteId], (err, result) => {
    if (err) {
      console.error('Failed to update note:', err);
      return res.status(500).json({ message: 'Failed to update note' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(200).json({ message: 'Note updated successfully' });
  });
});

// Delete Note
app.delete('/notes/:id', (req, res) => {
  const noteId = req.params.id;
  db.query('DELETE FROM notes WHERE id = ?', [noteId], (err, result) => {
    if (err) {
      console.error('Failed to delete note:', err);
      return res.status(500).json({ message: 'Failed to delete note' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.status(200).json({ message: 'Note deleted successfully' });
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
