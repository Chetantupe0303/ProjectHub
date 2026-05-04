const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security and performance middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// CORS configuration for Vercel
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',');
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow all origins in development
    if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());

// Connect to MongoDB
const User = require('./models/User');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/student-project-manager')
.then(async () => {
  console.log('MongoDB connected');
  
  const headadminExists = await User.findOne({ role: 'headadmin' });
  if (!headadminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    await User.create({
      email: 'admin@test.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'headadmin'
    });
    console.log('Default headadmin created: admin@test.com / admin123');
  }
})
.catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/github', require('./routes/github'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Serve frontend
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('Student Project Manager API is running');
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

