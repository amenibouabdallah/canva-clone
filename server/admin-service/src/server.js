const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'supersecretkey';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/canva-clone';

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
});
const Admin = mongoose.model('Admin', adminSchema);

mongoose.connect(MONGODB_URI).then(() => console.log('Connected to MongoDB (admin-service)')).catch(console.error);

// Admin login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin || !bcrypt.compareSync(password, admin.passwordHash)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Auth middleware
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token' });
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Connect to all databases for cross-service models
const DESIGN_DB_URI = process.env.DESIGN_DB_URI || 'mongodb://localhost:27017/design-service';
const UPLOAD_DB_URI = process.env.UPLOAD_DB_URI || 'mongodb://localhost:27017/upload-service';
const USER_DB_URI = process.env.USER_DB_URI || 'mongodb://localhost:27017/db_users_gateway';

const designConnection = mongoose.createConnection(DESIGN_DB_URI, { dbName: 'design-service' });
const uploadConnection = mongoose.createConnection(UPLOAD_DB_URI, { dbName: 'upload-service' });
const userConnection = mongoose.createConnection(USER_DB_URI, { dbName: 'db_users_gateway' });

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  name: { type: String },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  loginCount: { type: Number, default: 0 },
  loginLogs: [
    {
      date: { type: Date, default: Date.now },
      message: { type: String },
    },
  ],
});

const User = userConnection.model('User', userSchema);

const designSchema = new mongoose.Schema({
  userId: String,
  name: String,
  canvasData: String,
  width: Number,
  height: Number,
  category: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});
const Design = designConnection.model('Design', designSchema);

const mediaSchema = new mongoose.Schema({
  userId: String,
  name: String,
  cloudinaryId: String,
  url: String,
  mimeType: String,
  size: Number,
  width: Number,
  height: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const Media = uploadConnection.model('Media', mediaSchema);

// KPIs endpoint
app.get('/kpis', auth, async (req, res) => {
  try {
    const [uploads, designs, users] = await Promise.all([
      Media.countDocuments(),
      Design.countDocuments(),
      User.countDocuments(),
    ]);
    res.json({ uploads, designs, users });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch KPIs', error: err.message });
  }
});

// Stats endpoint
app.get('/stats', auth, async (req, res) => {
  try {
    const last7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const uploadsPerDay = await Media.aggregate([
      { $match: { createdAt: { $gte: last7 } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    const designsPerDay = await Design.aggregate([
      { $match: { createdAt: { $gte: last7 } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    const usersPerDay = await User.aggregate([
      { $match: { createdAt: { $gte: last7 } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    // Fill missing days with 0
    function fillDays(arr) {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const key = d.toISOString().slice(0, 10);
        const found = arr.find(x => x._id === key);
        days.push(found ? found.count : 0);
      }
      return days;
    }
    res.json({
      uploadsPerDay: fillDays(uploadsPerDay),
      designsPerDay: fillDays(designsPerDay),
      usersPerDay: fillDays(usersPerDay),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats', error: err.message });
  }
});

// Endpoint to fetch all users from db-users-gateway
app.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find({}, '-passwordHash'); // Exclude passwordHash if present
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
});

// Endpoint to delete a user by ID from db_users_gateway
app.delete('/users/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await User.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
});

const PORT = process.env.PORT || 4004;
app.listen(PORT, () => console.log(`Admin service running on port ${PORT}`));
