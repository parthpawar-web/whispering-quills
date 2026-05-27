const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Initialize Express App
const app = express();

// Connect to MongoDB
connectDB();

// Apply Global Middlewares
const allowedOrigins = [
  'https://whispering-quills.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Standard root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Whispering Quills API',
    version: '1.0.0',
    description: 'A Vintage Story Sharing Platform Backend API',
    status: 'Healthy',
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/stories', require('./routes/storyRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Centralized Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n`);
  console.log(`\x1b[35m%s\x1b[0m`, `  ✦ . ˚ ✦ . ˚ ✦ . ˚ ✦ . ˚ ✦ . ˚ ✦ . ˚ ✦ . ˚ ✦`);
  console.log(`\x1b[36m%s\x1b[0m`, `   ⭐  Whispering Quills Server Running...  ⭐`);
  console.log(`\x1b[33m%s\x1b[0m`, `   - Port: ${PORT}`);
  console.log(`\x1b[33m%s\x1b[0m`, `   - Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\x1b[33m%s\x1b[0m`, `   - Database: ${process.env.MONGO_URI && process.env.MONGO_URI.includes('mongodb+srv') ? 'MongoDB Atlas Cloud' : 'MongoDB Local (27017)'}`);
  console.log(`\x1b[35m%s\x1b[0m`, `  ✦ . ˚ ✦ . ˚ ✦ . ˚ ✦ . ˚ ✦ . ˚ ✦ . ˚ ✦ . ˚ ✦`);
  console.log(`\n`);
});
