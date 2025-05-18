const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/canva-clone';

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
});

const Admin = mongoose.model('Admin', adminSchema);

async function createAdmin(email, password) {
  await mongoose.connect(MONGODB_URI);
  const passwordHash = await bcrypt.hash(password, 10);
  const admin = new Admin({ email, passwordHash });
  await admin.save();
  console.log('Admin created:', email);
  await mongoose.disconnect();
}

// Usage: node create-admin.js admin@canva-clone.com admin123
const [,, email, password] = process.argv;
if (!email || !password) {
  console.log('Usage: node create-admin.js <email> <password>');
  process.exit(1);
}
createAdmin(email, password).catch(err => {
  console.error(err);
  process.exit(1);
});
