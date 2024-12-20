
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'your_password',
    database: 'notes_db'
});

// Connect to MySQL
db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Create notes table if it doesn't exist
db.query(`
    CREATE TABLE IF NOT EXISTS notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
`, (err) => {
    if (err) {
        console.error('Error creating table:', err);
    }
});

// Routes
// Get all notes
app.get('/api/notes', (req, res) => {
    db.query('SELECT * FROM notes ORDER BY created_at DESC', (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results);
    });
});

// Add a new note
app.post('/api/notes', (req, res) => {
    const { title, content } = req.body;
    db.query('INSERT INTO notes (title, content) VALUES (?, ?)', 
        [title, content], 
        (err, result) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: result.insertId, title, content });
        }
    );
});

// Delete a note
app.delete('/api/notes/:id', (req, res) => {
    db.query('DELETE FROM notes WHERE id = ?', 
        [req.params.id], 
        (err) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: 'Note deleted successfully' });
        }
    );
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});