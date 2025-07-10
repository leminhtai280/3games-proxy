const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/User');

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/user-management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.username);
      process.exit(0);
    }

    // Create admin user
    const adminData = {
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      fullName: 'Administrator',
      role: 'admin',
      isActive: true
    };

    const admin = new User(adminData);
    await admin.save();

    console.log('Admin user created successfully!');
    console.log('Username:', adminData.username);
    console.log('Password:', adminData.password);
    console.log('Please change the password after first login!');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createAdminUser();