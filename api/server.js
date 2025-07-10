import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database setup
const db = new sqlite3.Database('wallet.db');

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT,
    balance REAL DEFAULT 0,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Transactions table
  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE,
    user_id INTEGER,
    type TEXT, -- 'deposit', 'withdrawal', 'transfer'
    amount REAL,
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Create default admin user
  const adminEmail = 'admin@wallet.com';
  const adminPassword = bcrypt.hashSync('admin123', 10);
  
  db.run(`INSERT OR IGNORE INTO users (uuid, username, email, password, role, balance) 
          VALUES (?, ?, ?, ?, ?, ?)`, 
          [uuidv4(), 'admin', adminEmail, adminPassword, 'admin', 10000]);
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Routes

// User Registration
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userUuid = uuidv4();

    db.run(
      'INSERT INTO users (uuid, username, email, password) VALUES (?, ?, ?, ?)',
      [userUuid, username, email, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Username or email already exists' });
          }
          return res.status(500).json({ error: 'Registration failed' });
        }

        const token = jwt.sign(
          { id: this.lastID, uuid: userUuid, username, role: 'user' },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.status(201).json({
          message: 'User registered successfully',
          token,
          user: { id: this.lastID, uuid: userUuid, username, email, balance: 0, role: 'user' }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// User Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, uuid: user.uuid, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        uuid: user.uuid,
        username: user.username,
        email: user.email,
        balance: user.balance,
        role: user.role
      }
    });
  });
});

// Get user profile
app.get('/api/profile', authenticateToken, (req, res) => {
  db.get('SELECT id, uuid, username, email, balance, role, created_at FROM users WHERE id = ?', 
    [req.user.id], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  });
});

// Deposit money
app.post('/api/deposit', authenticateToken, (req, res) => {
  const { amount } = req.body;
  const userId = req.user.id;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  const transactionUuid = uuidv4();

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Create transaction record
    db.run(
      'INSERT INTO transactions (uuid, user_id, type, amount, description) VALUES (?, ?, ?, ?, ?)',
      [transactionUuid, userId, 'deposit', amount, 'Money deposit'],
      function(err) {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: 'Transaction failed' });
        }

        // Update user balance
        db.run(
          'UPDATE users SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [amount, userId],
          function(err) {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({ error: 'Balance update failed' });
            }

            // Complete transaction
            db.run(
              'UPDATE transactions SET status = ? WHERE uuid = ?',
              ['completed', transactionUuid],
              (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  return res.status(500).json({ error: 'Transaction completion failed' });
                }

                db.run('COMMIT');
                res.json({
                  message: 'Deposit successful',
                  transaction: {
                    uuid: transactionUuid,
                    amount,
                    type: 'deposit',
                    status: 'completed'
                  }
                });
              }
            );
          }
        );
      }
    );
  });
});

// Get transaction history
app.get('/api/transactions', authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  db.all(
    'SELECT uuid, type, amount, status, description, created_at FROM transactions WHERE user_id = ? ORDER BY created_at DESC',
    [userId],
    (err, transactions) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch transactions' });
      }
      res.json(transactions);
    }
  );
});

// Admin Routes

// Get all users (Admin only)
app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  db.all(
    'SELECT id, uuid, username, email, balance, role, created_at FROM users ORDER BY created_at DESC',
    (err, users) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch users' });
      }
      res.json(users);
    }
  );
});

// Get all transactions (Admin only)
app.get('/api/admin/transactions', authenticateToken, requireAdmin, (req, res) => {
  db.all(
    `SELECT t.uuid, t.type, t.amount, t.status, t.description, t.created_at,
            u.username, u.email
     FROM transactions t
     JOIN users u ON t.user_id = u.id
     ORDER BY t.created_at DESC`,
    (err, transactions) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch transactions' });
      }
      res.json(transactions);
    }
  );
});

// Update user balance (Admin only)
app.put('/api/admin/users/:id/balance', authenticateToken, requireAdmin, (req, res) => {
  const { balance } = req.body;
  const userId = req.params.id;

  if (balance < 0) {
    return res.status(400).json({ error: 'Balance cannot be negative' });
  }

  db.run(
    'UPDATE users SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [balance, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update balance' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ message: 'Balance updated successfully' });
    }
  );
});

// Dashboard stats (Admin only)
app.get('/api/admin/stats', authenticateToken, requireAdmin, (req, res) => {
  const stats = {};

  db.serialize(() => {
    // Count total users
    db.get('SELECT COUNT(*) as totalUsers FROM users WHERE role = "user"', (err, result) => {
      if (!err) stats.totalUsers = result.totalUsers;
    });

    // Sum total balance
    db.get('SELECT SUM(balance) as totalBalance FROM users', (err, result) => {
      if (!err) stats.totalBalance = result.totalBalance || 0;
    });

    // Count total transactions
    db.get('SELECT COUNT(*) as totalTransactions FROM transactions', (err, result) => {
      if (!err) stats.totalTransactions = result.totalTransactions;
    });

    // Sum total deposits
    db.get('SELECT SUM(amount) as totalDeposits FROM transactions WHERE type = "deposit" AND status = "completed"', (err, result) => {
      if (!err) stats.totalDeposits = result.totalDeposits || 0;
      res.json(stats);
    });
  });
});

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Catch all handler for React Router
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Admin credentials: admin@wallet.com / admin123`);
});